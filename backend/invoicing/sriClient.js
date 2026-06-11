const axios = require('axios');
const { documentReception, documentAuthorization } = require('open-factura');
const { getSriConfig } = require('./config');

// open-factura no maneja el error de createClient (crashea si el WSDL no carga):
// verificar disponibilidad del WSDL antes de invocar SOAP.
async function assertWsdlReachable(url, label) {
  try {
    await axios.get(url, { timeout: 10000 });
  } catch (e) {
    throw new Error(`Servicio de ${label} del SRI no disponible (${e.message})`);
  }
}

const SRI_TIMEOUT_MS = 30000;
const AUTH_POLL_ATTEMPTS = 4;
const AUTH_POLL_DELAY_MS = 3000;

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout (${ms / 1000}s) en ${label} del SRI`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function extractMensajes(node) {
  if (!node) return [];
  const raw = node.mensajes?.mensaje ?? node.mensaje ?? [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.filter(Boolean).map((m) => ({
    identificador: m.identificador || null,
    mensaje: m.mensaje || '',
    informacionAdicional: m.informacionAdicional || null,
    tipo: m.tipo || null
  }));
}

// Recepción: RECIBIDA | DEVUELTA
async function sendReception(signedXml) {
  const { urls } = getSriConfig();
  await assertWsdlReachable(urls.recepcion, 'recepción');
  const result = await withTimeout(documentReception(signedXml, urls.recepcion), SRI_TIMEOUT_MS, 'recepción');
  const respuesta = result?.RespuestaRecepcionComprobante || result || {};
  const estado = respuesta.estado || 'DESCONOCIDO';

  let mensajes = [];
  const comprobantesRaw = respuesta.comprobantes?.comprobante;
  const comprobantes = Array.isArray(comprobantesRaw) ? comprobantesRaw : (comprobantesRaw ? [comprobantesRaw] : []);
  comprobantes.forEach((c) => { mensajes = mensajes.concat(extractMensajes(c)); });

  return { estado, mensajes, raw: respuesta };
}

// Autorización (poll con reintentos): AUTORIZADO | NO AUTORIZADO | EN PROCESO
async function requestAuthorization(accessKey) {
  const { urls } = getSriConfig();
  await assertWsdlReachable(urls.autorizacion, 'autorización');
  let last = { estado: 'EN PROCESO', mensajes: [], numeroAutorizacion: null, fechaAutorizacion: null, xmlAutorizado: null, raw: null };

  for (let attempt = 1; attempt <= AUTH_POLL_ATTEMPTS; attempt++) {
    if (attempt > 1) await sleep(AUTH_POLL_DELAY_MS * (attempt - 1));

    let result;
    try {
      result = await withTimeout(documentAuthorization(accessKey, urls.autorizacion), SRI_TIMEOUT_MS, 'autorización');
    } catch (e) {
      last = { ...last, estado: 'ERROR', mensajes: [{ mensaje: e.message || String(e) }] };
      continue;
    }

    const respuesta = result?.RespuestaAutorizacionComprobante || result || {};
    const autRaw = respuesta.autorizaciones?.autorizacion;
    const autorizaciones = Array.isArray(autRaw) ? autRaw : (autRaw ? [autRaw] : []);
    const aut = autorizaciones[0];

    if (!aut) {
      last = { ...last, estado: 'EN PROCESO', raw: respuesta };
      continue;
    }

    last = {
      estado: aut.estado || 'DESCONOCIDO',
      numeroAutorizacion: aut.numeroAutorizacion || null,
      fechaAutorizacion: aut.fechaAutorizacion || null,
      ambiente: aut.ambiente || null,
      xmlAutorizado: aut.comprobante || null,
      mensajes: extractMensajes(aut),
      raw: respuesta
    };

    if (last.estado === 'AUTORIZADO' || last.estado === 'NO AUTORIZADO') return last;
  }

  return last;
}

module.exports = { sendReception, requestAuthorization };
