const crypto = require('crypto');
const { isCrmOperator, signCrmProof } = require('./crmOtp');

function createCrmSessionProof({ proofSecret }) {
  return (req, res) => {
    if (!req.adminSession || !isCrmOperator(req.adminSession.email)) {
      return res.status(403).json({ success: false, error: 'Acceso CRM no autorizado' });
    }
    try {
      return res.json({ proof: signCrmProof({
        email: req.adminSession.email,
        jti: crypto.randomUUID(),
        secret: proofSecret(),
      }) });
    } catch (error) {
      console.error('[CRM_AUTH] Error emitiendo prueba de sesion:', error.message);
      return res.status(500).json({ success: false, error: 'No se pudo procesar el acceso CRM.' });
    }
  };
}

module.exports = { createCrmSessionProof };
