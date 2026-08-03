const crypto = require('crypto');

function parseJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return null; }
}

function createPaymentStateStore({ db = null, now = Date.now, randomBytes = crypto.randomBytes } = {}) {
  const orders = new Map();
  const sessions = new Map();
  const approvals = new Map();
  const claims = new Map();

  async function query(sql, params) {
    if (!db) return null;
    try { return await db.query(sql, params); } catch (error) {
      console.error('Payment state persistence unavailable:', error.message);
      return null;
    }
  }

  async function saveOrder(clientTransactionId, orderData) {
    orders.set(clientTransactionId, orderData);
    await query(
      `INSERT INTO payment_states (client_transaction_id, order_data, created_at, updated_at)
       VALUES (?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE order_data = VALUES(order_data), updated_at = NOW()`,
      [clientTransactionId, JSON.stringify(orderData)],
    );
  }

  async function getOrder(clientTransactionId) {
    if (orders.has(clientTransactionId)) return orders.get(clientTransactionId);
    const result = await query(
      'SELECT order_data FROM payment_states WHERE client_transaction_id = ? LIMIT 1',
      [clientTransactionId],
    );
    const orderData = parseJson(result?.rows?.[0]?.order_data);
    if (orderData) orders.set(clientTransactionId, orderData);
    return orderData;
  }

  async function deleteOrder(clientTransactionId) {
    orders.delete(clientTransactionId);
    claims.delete(clientTransactionId);
    await query(
      'UPDATE payment_states SET order_data = NULL, processing_at = NULL, updated_at = NOW() WHERE client_transaction_id = ?',
      [clientTransactionId],
    );
  }

  async function claimOrder(clientTransactionId, leaseMs = 5 * 60 * 1000) {
    const claimedAt = claims.get(clientTransactionId);
    if (claimedAt && claimedAt > now() - leaseMs) return null;

    const result = await query(
      `UPDATE payment_states SET processing_at = NOW(), updated_at = NOW()
       WHERE client_transaction_id = ? AND order_data IS NOT NULL
         AND (processing_at IS NULL OR processing_at < FROM_UNIXTIME(? / 1000))`,
      [clientTransactionId, now() - leaseMs],
    );
    if (result && result.rowCount !== 1) return null;

    const orderData = await getOrder(clientTransactionId);
    if (!orderData) return null;
    claims.set(clientTransactionId, now());
    return orderData;
  }

  async function releaseOrder(clientTransactionId) {
    claims.delete(clientTransactionId);
    await query(
      'UPDATE payment_states SET processing_at = NULL, updated_at = NOW() WHERE client_transaction_id = ?',
      [clientTransactionId],
    );
  }

  async function issueSession(clientTransactionId, ttlMs = 60 * 60 * 1000) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = now() + ttlMs;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    sessions.set(clientTransactionId, { tokenHash, expiresAt });
    await query(
      `INSERT INTO payment_states
         (client_transaction_id, session_token_hash, session_expires_at, created_at, updated_at)
       VALUES (?, ?, FROM_UNIXTIME(? / 1000), NOW(), NOW())
       ON DUPLICATE KEY UPDATE session_token_hash = VALUES(session_token_hash),
         session_expires_at = VALUES(session_expires_at), updated_at = NOW()`,
      [clientTransactionId, tokenHash, expiresAt],
    );
    return token;
  }

  async function validateSession(clientTransactionId, providedToken) {
    if (typeof providedToken !== 'string' || !/^[a-f0-9]{64}$/i.test(providedToken)) return false;
    let record = sessions.get(clientTransactionId);
    if (!record) {
      const result = await query(
        `SELECT session_token_hash, UNIX_TIMESTAMP(session_expires_at) * 1000 AS expires_at
         FROM payment_states WHERE client_transaction_id = ? LIMIT 1`,
        [clientTransactionId],
      );
      const row = result?.rows?.[0];
      if (row?.session_token_hash) {
        record = { tokenHash: row.session_token_hash, expiresAt: Number(row.expires_at) };
        sessions.set(clientTransactionId, record);
      }
    }
    if (!record || record.expiresAt <= now()) {
      sessions.delete(clientTransactionId);
      return false;
    }
    const providedHash = crypto.createHash('sha256').update(providedToken).digest();
    const expectedHash = Buffer.from(record.tokenHash, 'hex');
    return providedHash.length === expectedHash.length && crypto.timingSafeEqual(providedHash, expectedHash);
  }

  async function rememberApproval(clientTransactionId, payload) {
    if (!clientTransactionId) return;
    const record = { ...payload, approvedAt: now() };
    approvals.set(clientTransactionId, record);
    await query(
      `INSERT INTO payment_states
         (client_transaction_id, approval_data, approved_at, created_at, updated_at)
       VALUES (?, ?, FROM_UNIXTIME(? / 1000), NOW(), NOW())
       ON DUPLICATE KEY UPDATE approval_data = VALUES(approval_data),
         approved_at = VALUES(approved_at), updated_at = NOW()`,
      [clientTransactionId, JSON.stringify(payload), record.approvedAt],
    );
  }

  async function getApproval(clientTransactionId, ttlMs = 10 * 60 * 1000) {
    let record = approvals.get(clientTransactionId);
    if (!record) {
      const result = await query(
        `SELECT approval_data, UNIX_TIMESTAMP(approved_at) * 1000 AS approved_at
         FROM payment_states WHERE client_transaction_id = ? LIMIT 1`,
        [clientTransactionId],
      );
      const row = result?.rows?.[0];
      const payload = parseJson(row?.approval_data);
      if (payload) {
        record = { ...payload, approvedAt: Number(row.approved_at) };
        approvals.set(clientTransactionId, record);
      }
    }
    if (!record || record.approvedAt < now() - ttlMs) {
      approvals.delete(clientTransactionId);
      return null;
    }
    return record;
  }

  async function cleanup(orderTtlMs = 30 * 60 * 1000) {
    const cutoff = now() - orderTtlMs;
    for (const [key, value] of orders) {
      if (value?.__createdAt < cutoff) orders.delete(key);
    }
    for (const [key, value] of sessions) {
      if (value.expiresAt <= now()) sessions.delete(key);
    }
    await query(
      `UPDATE payment_states SET order_data = NULL, updated_at = NOW()
       WHERE order_data IS NOT NULL AND created_at < FROM_UNIXTIME(? / 1000)`,
      [cutoff],
    );
  }

  return {
    saveOrder,
    getOrder,
    claimOrder,
    releaseOrder,
    deleteOrder,
    issueSession,
    validateSession,
    rememberApproval,
    getApproval,
    cleanup,
  };
}

module.exports = { createPaymentStateStore };
