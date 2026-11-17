const crypto = require('crypto');

const WINDOW_MS = 15 * 60 * 1000;

function positiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function createCrmOtpStore({ pool, config = {} }) {
  const ttlMs = positiveInt(config.ttlMs, 10 * 60 * 1000);
  const cooldownMs = positiveInt(config.cooldownMs, 60 * 1000);
  const maxAttempts = positiveInt(config.maxAttempts, 5);
  const lockMs = positiveInt(config.lockMs, WINDOW_MS);
  const ipMaxRequests = positiveInt(config.ipMaxRequests, 5);
  let initialized;

  function ready() {
    if (!initialized) {
      initialized = (async () => {
        // Schema changes belong to a verified migration, never a login request.
        // Fail closed if either table or its SELECT permission is missing.
        await pool.query('SELECT email FROM crm_auth_otp LIMIT 0');
        await pool.query('SELECT limit_key FROM crm_auth_limits LIMIT 0');
      })().catch((error) => {
        initialized = undefined;
        throw error;
      });
    }
    return initialized;
  }

  async function transaction(fn) {
    await ready();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [[{ now_ms: now }]] = await connection.query('SELECT ROUND(UNIX_TIMESTAMP(NOW(3)) * 1000) AS now_ms');
      const result = await fn(connection, Number(now));
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Never store raw IPs. The caller must use the socket peer, not client-supplied
  // X-Forwarded-For; a trusted proxy can otherwise be used to evade limits.
  function ipKey(purpose, ip) {
    return crypto.createHash('sha256').update(`${purpose}:${ip}`).digest('hex');
  }

  async function lockedLimit(connection, key, now) {
    await connection.query('INSERT INTO crm_auth_limits (limit_key) VALUES (?) ON DUPLICATE KEY UPDATE limit_key = limit_key', [key]);
    const [[row]] = await connection.query('SELECT window_start, attempts, lock_until FROM crm_auth_limits WHERE limit_key = ? FOR UPDATE', [key]);
    const expired = now - Number(row.window_start) >= WINDOW_MS;
    const start = expired ? now : Number(row.window_start);
    return {
      key,
      start,
      count: expired ? 0 : Number(row.attempts),
      locked: Number(row.lock_until) > now,
    };
  }

  async function countLimit(connection, limit, now, max, lockDuration) {
    const count = limit.count + 1;
    await connection.query('UPDATE crm_auth_limits SET window_start = ?, attempts = ?, lock_until = ? WHERE limit_key = ?',
      [limit.start, count, count >= max ? now + lockDuration : 0, limit.key]);
  }

  async function request({ ip, email, hash }) {
    return transaction(async (connection, now) => {
      const limit = await lockedLimit(connection, ipKey('request', ip), now);
      if (limit.locked || limit.count >= ipMaxRequests) return 'limited';
      await countLimit(connection, limit, now, ipMaxRequests, WINDOW_MS);
      if (!hash) return 'ignored';

      await connection.query('INSERT INTO crm_auth_otp (email) VALUES (?) ON DUPLICATE KEY UPDATE email = email', [email]);
      const [[record]] = await connection.query('SELECT requested_at FROM crm_auth_otp WHERE email = ? FOR UPDATE', [email]);
      if (now - Number(record.requested_at) < cooldownMs) return 'cooldown';
      await connection.query('UPDATE crm_auth_otp SET code_hash = ?, expires_at = ?, requested_at = ?, attempts = 0 WHERE email = ?',
        [hash, now + ttlMs, now, email]);
      return 'sent';
    });
  }

  async function revoke(email, hash) {
    await ready();
    // Only revoke our own code if another request has replaced it.
    await pool.query('UPDATE crm_auth_otp SET code_hash = NULL, expires_at = 0 WHERE email = ? AND code_hash = ?', [email, hash]);
  }

  async function verify({ ip, email, candidateHash }) {
    return transaction(async (connection, now) => {
      const limit = await lockedLimit(connection, ipKey('verify', ip), now);
      if (limit.locked || limit.count >= maxAttempts) return 'limited';

      let record;
      if (candidateHash) {
        // The same row serializes web and mobile verifications across workers.
        const [[found]] = await connection.query('SELECT code_hash, expires_at, attempts FROM crm_auth_otp WHERE email = ? FOR UPDATE', [email]);
        record = found;
      }
      const valid = record?.code_hash && Number(record.expires_at) > now
        && Number(record.attempts) < maxAttempts
        && crypto.timingSafeEqual(Buffer.from(candidateHash, 'hex'), Buffer.from(record.code_hash, 'hex'));
      if (valid) {
        await connection.query('UPDATE crm_auth_otp SET code_hash = NULL, expires_at = 0 WHERE email = ?', [email]);
        return 'verified';
      }

      await countLimit(connection, limit, now, maxAttempts, lockMs);
      if (record?.code_hash) {
        await connection.query(`UPDATE crm_auth_otp SET attempts = attempts + 1,
          code_hash = IF(attempts + 1 >= ? OR expires_at <= ?, NULL, code_hash)
          WHERE email = ?`, [maxAttempts, now, email]);
      }
      return 'invalid';
    });
  }

  async function cleanup() {
    await ready();
    await pool.query('DELETE FROM crm_auth_limits WHERE window_start < ROUND(UNIX_TIMESTAMP(NOW(3)) * 1000) - ?',
      [Math.max(WINDOW_MS, lockMs) * 2]);
  }

  return { request, revoke, verify, cleanup };
}

module.exports = { createCrmOtpStore };
