const express = require('express');
const crypto = require('crypto');
const { CRM_OPERATOR_EMAIL, createCrmOtp, hashCrmOtp, normalizeCrmEmail, signCrmProof } = require('./crmOtp');

// `operatorEmail` is an internal router-factory dependency for isolated tests;
// server.js does not pass an override, preserving the sole configured operator.
function createCrmAuthRouter({ store, hashSecret, proofSecret, sendCode, createAdminSession, operatorEmail = CRM_OPERATOR_EMAIL }) {
  const router = express.Router();
  const allowedEmail = normalizeCrmEmail(operatorEmail);
  if (!allowedEmail) throw new Error('CRM operator email is required');
  const isAllowed = (email) => normalizeCrmEmail(email) === allowedEmail;

  router.post('/request-code', async (req, res) => {
    const email = normalizeCrmEmail(req.body?.email);
    const genericResponse = { success: true, message: 'Si el acceso esta autorizado, enviaremos un codigo al correo indicado.' };
    // Never use an untrusted X-Forwarded-For header as a rate-limit key.
    const ip = req.socket.remoteAddress || 'unknown';
    try {
      const allowed = isAllowed(email);
      const code = allowed ? createCrmOtp() : null;
      const hash = allowed ? hashCrmOtp(code, hashSecret()) : null;
      const result = await store.request({ ip, email, hash });
      if (result === 'limited') {
        return res.status(429).json({ success: false, error: 'Demasiadas solicitudes. Espera unos minutos antes de intentar de nuevo.' });
      }
      if (result === 'sent') {
        try {
          await sendCode({ to: allowedEmail, code });
        } catch (error) {
          await store.revoke(email, hash);
          throw error;
        }
      }
      return res.json(genericResponse);
    } catch (error) {
      console.error('[CRM_AUTH] Error emitiendo codigo:', error.message);
      return res.status(500).json({ success: false, error: 'No se pudo procesar la solicitud de acceso.' });
    }
  });

  function verify(mobile) {
    return async (req, res) => {
      const email = normalizeCrmEmail(req.body?.email);
      const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
      const ip = req.socket.remoteAddress || 'unknown';
      try {
        // Fail closed before consuming a code if proof signing is unavailable.
        const secret = proofSecret();
        const candidateHash = isAllowed(email) && /^\d{8}$/.test(code)
          ? hashCrmOtp(code, hashSecret()) : null;
        const proof = signCrmProof({ email, jti: crypto.randomUUID(), secret,
          audience: mobile ? 'hermes-crm-mobile' : 'hermes-crm' });
        const result = await store.verify({ ip, email, candidateHash });
        if (result === 'limited') {
          return res.status(429).json({ success: false, error: 'Demasiados intentos. Solicita un nuevo codigo mas tarde.' });
        }
        if (result !== 'verified') {
          return res.status(400).json({ success: false, error: 'Codigo invalido o expirado. Solicita uno nuevo.' });
        }
        if (mobile) return res.json({ success: true, proof });
        return res.json({ success: true, proof, adminToken: createAdminSession(email) });
      } catch (error) {
        console.error('[CRM_AUTH] Error verificando codigo:', error.message);
        return res.status(500).json({ success: false, error: 'No se pudo validar el acceso.' });
      }
    };
  }

  router.post('/verify-code', verify(false));
  router.post('/mobile/verify-code', verify(true));
  return router;
}

module.exports = { createCrmAuthRouter };
