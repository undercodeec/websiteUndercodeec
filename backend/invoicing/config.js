require('dotenv').config();
const path = require('path');

// Endpoints SOAP oficiales del SRI por ambiente
const SRI_URLS = {
  '1': {
    recepcion: 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl',
    autorizacion: 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl'
  },
  '2': {
    recepcion: 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl',
    autorizacion: 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl'
  }
};

function getSriConfig() {
  const ambiente = process.env.SRI_AMBIENTE === '2' ? '2' : '1';
  return {
    ambiente,
    urls: SRI_URLS[ambiente],
    ruc: (process.env.SRI_RUC || '').trim(),
    razonSocial: (process.env.SRI_RAZON_SOCIAL || '').trim(),
    nombreComercial: (process.env.SRI_NOMBRE_COMERCIAL || '').trim(),
    dirMatriz: (process.env.SRI_DIR_MATRIZ || '').trim(),
    estab: (process.env.SRI_ESTAB || '001').trim(),
    ptoEmi: (process.env.SRI_PTO_EMI || '002').trim(),
    secuencialInicio: parseInt(process.env.SRI_SECUENCIAL_INICIO, 10) || 1,
    obligadoContabilidad: process.env.SRI_OBLIGADO_CONTABILIDAD === 'SI' ? 'SI' : 'NO',
    contribuyenteRimpe: (process.env.SRI_CONTRIBUYENTE_RIMPE || '').trim() || null,
    p12Path: path.resolve(__dirname, '..', process.env.SRI_P12_PATH || './secrets/firma.p12'),
    p12Password: process.env.SRI_P12_PASSWORD || ''
  };
}

// Devuelve la lista de campos del emisor que faltan por configurar en el .env
function getMissingSriConfig(cfg = getSriConfig()) {
  const missing = [];
  if (!/^\d{13}$/.test(cfg.ruc)) missing.push('SRI_RUC (13 dígitos)');
  if (!cfg.razonSocial) missing.push('SRI_RAZON_SOCIAL');
  if (!cfg.dirMatriz) missing.push('SRI_DIR_MATRIZ');
  if (!/^\d{3}$/.test(cfg.estab)) missing.push('SRI_ESTAB (3 dígitos)');
  if (!/^\d{3}$/.test(cfg.ptoEmi)) missing.push('SRI_PTO_EMI (3 dígitos)');
  return missing;
}

// Campos necesarios solo para FIRMAR (fase de emisión real)
function getMissingSigningConfig(cfg = getSriConfig()) {
  const fs = require('fs');
  const missing = [];
  if (!fs.existsSync(cfg.p12Path)) missing.push(`Certificado .p12 no encontrado en ${cfg.p12Path}`);
  if (!cfg.p12Password) missing.push('SRI_P12_PASSWORD');
  return missing;
}

module.exports = { getSriConfig, getMissingSriConfig, getMissingSigningConfig, SRI_URLS };
