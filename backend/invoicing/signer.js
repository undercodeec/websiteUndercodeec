const { signXml, getP12FromLocalFile } = require('open-factura');
const { getSriConfig, getMissingSigningConfig } = require('./config');

async function signInvoiceXml(xml) {
  const cfg = getSriConfig();
  const missing = getMissingSigningConfig(cfg);
  if (missing.length) {
    const err = new Error('Configuración de firma incompleta: ' + missing.join('; '));
    err.code = 'SIGNING_CONFIG_MISSING';
    throw err;
  }
  const p12Data = getP12FromLocalFile(cfg.p12Path);
  try {
    return await signXml(p12Data, cfg.p12Password, xml);
  } catch (e) {
    const err = new Error('Error firmando XML (verifique .p12 y contraseña): ' + (e.message || e));
    err.code = 'SIGNING_FAILED';
    throw err;
  }
}

module.exports = { signInvoiceXml };
