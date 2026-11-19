const crypto = require('crypto');

const ADMIN_IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000;

function createAdminSessions({ now = Date.now } = {}) {
  const sessions = new Map();

  function create(email) {
    const token = crypto.randomBytes(32).toString('hex');
    const time = now();
    sessions.set(token, { email, createdAt: time, lastHumanActivityAt: time });
    return token;
  }

  function get(token) {
    const session = sessions.get(token);
    if (!session) return null;
    const time = now();
    // Reject a missing/invalid timestamp rather than allowing automatic traffic
    // (or a clock moving backwards) to restore an expired session.
    if (!Number.isFinite(session.lastHumanActivityAt) ||
        time < session.lastHumanActivityAt ||
        time - session.lastHumanActivityAt >= ADMIN_IDLE_TIMEOUT_MS) {
      sessions.delete(token);
      return null;
    }
    return { ...session, expiresAt: session.lastHumanActivityAt + ADMIN_IDLE_TIMEOUT_MS };
  }

  function recordHumanActivity(token) {
    const session = get(token);
    if (!session) return false;
    sessions.get(token).lastHumanActivityAt = now();
    return true;
  }

  function cleanup() {
    for (const token of sessions.keys()) get(token);
  }

  return { create, get, recordHumanActivity, cleanup, delete: (token) => sessions.delete(token),
    clear: () => sessions.clear(), keys: () => sessions.keys() };
}

module.exports = { createAdminSessions, ADMIN_IDLE_TIMEOUT_MS };
