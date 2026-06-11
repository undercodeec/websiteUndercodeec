const db = require('../db');
const { getSriConfig, getMissingSriConfig } = require('./config');
const { buildInvoice } = require('./invoiceBuilder');
const { signInvoiceXml } = require('./signer');
const { sendReception, requestAuthorization } = require('./sriClient');

function parseSriDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

async function updateInvoice(id, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return;
  const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  await db.query(`UPDATE invoices SET ${sets} WHERE id = $${keys.length + 1}`, [...Object.values(fields), id]);
}

async function getInvoice(id) {
  const r = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);
  return r.rows[0] || null;
}

// Reserva el siguiente secuencial de la serie (ambiente+estab+ptoEmi) e inserta
// la fila inicial dentro de una transacción (FOR UPDATE evita duplicados).
async function reserveInvoiceRow({ comprador, items, formaPago, orderId }) {
  const cfg = getSriConfig();
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      'SELECT COALESCE(MAX(secuencial), 0) AS maxSec FROM invoices WHERE ambiente = ? AND estab = ? AND pto_emi = ? FOR UPDATE',
      [Number(cfg.ambiente), cfg.estab, cfg.ptoEmi]
    );
    const secuencial = Math.max(Number(rows[0].maxSec) + 1, cfg.secuencialInicio);

    const built = buildInvoice({ comprador, items, formaPago, secuencial, orderId });

    const [result] = await conn.query(
      `INSERT INTO invoices
        (order_id, ambiente, estab, pto_emi, secuencial, clave_acceso, estado,
         tipo_identificacion, identificacion, razon_social, direccion, email, telefono,
         items, forma_pago, subtotal, iva, total)
       VALUES (?, ?, ?, ?, ?, ?, 'generada', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId || null, Number(cfg.ambiente), cfg.estab, cfg.ptoEmi, secuencial, built.accessKey,
        comprador.tipoIdentificacion,
        built.invoice.factura.infoFactura.identificacionComprador,
        built.invoice.factura.infoFactura.razonSocialComprador,
        (comprador.direccion || '').trim() || null,
        (comprador.email || '').trim() || null,
        (comprador.telefono || '').trim() || null,
        JSON.stringify(items),
        built.formaPago,
        built.totals.subtotal, built.totals.iva, built.totals.total
      ]
    );
    await conn.commit();
    return { id: result.insertId, built };
  } catch (e) {
    await conn.rollback().catch(() => {});
    throw e;
  } finally {
    conn.release();
  }
}

// Recepción + autorización sobre un XML ya firmado. Actualiza estados en DB.
async function processWithSri(invoiceId, signedXml, accessKey) {
  let recepcion;
  try {
    recepcion = await sendReception(signedXml);
  } catch (e) {
    await updateInvoice(invoiceId, { estado: 'error', mensajes_sri: JSON.stringify([{ mensaje: e.message }]) });
    return getInvoice(invoiceId);
  }

  if (recepcion.estado === 'DEVUELTA') {
    await updateInvoice(invoiceId, { estado: 'devuelta', mensajes_sri: JSON.stringify(recepcion.mensajes) });
    return getInvoice(invoiceId);
  }
  if (recepcion.estado !== 'RECIBIDA') {
    await updateInvoice(invoiceId, {
      estado: 'error',
      mensajes_sri: JSON.stringify([{ mensaje: `Estado de recepción inesperado: ${recepcion.estado}` }, ...recepcion.mensajes])
    });
    return getInvoice(invoiceId);
  }

  await updateInvoice(invoiceId, { estado: 'recibida' });

  let auth;
  try {
    auth = await requestAuthorization(accessKey);
  } catch (e) {
    await updateInvoice(invoiceId, { mensajes_sri: JSON.stringify([{ mensaje: 'Recibida; error consultando autorización: ' + e.message }]) });
    return getInvoice(invoiceId);
  }

  if (auth.estado === 'AUTORIZADO') {
    await updateInvoice(invoiceId, {
      estado: 'autorizada',
      numero_autorizacion: auth.numeroAutorizacion || accessKey,
      fecha_autorizacion: parseSriDate(auth.fechaAutorizacion),
      mensajes_sri: JSON.stringify(auth.mensajes),
      xml_firmado: auth.xmlAutorizado || signedXml
    });
  } else if (auth.estado === 'NO AUTORIZADO') {
    await updateInvoice(invoiceId, { estado: 'no_autorizada', mensajes_sri: JSON.stringify(auth.mensajes) });
  } else {
    // EN PROCESO / ERROR transitorio: queda 'recibida', reintentable
    await updateInvoice(invoiceId, {
      mensajes_sri: JSON.stringify([{ mensaje: `Autorización pendiente (${auth.estado}). Use reintentar.` }, ...auth.mensajes])
    });
  }
  return getInvoice(invoiceId);
}

// Emisión completa: secuencial → XML → firma → recepción → autorización
async function emitInvoice({ comprador, items, formaPago, orderId = null }) {
  const missing = getMissingSriConfig();
  if (missing.length) {
    const err = new Error('Configuración SRI incompleta en .env: ' + missing.join('; '));
    err.code = 'SRI_CONFIG_MISSING';
    throw err;
  }

  const { id, built } = await reserveInvoiceRow({ comprador, items, formaPago, orderId });

  let signedXml;
  try {
    signedXml = await signInvoiceXml(built.xml);
  } catch (e) {
    await updateInvoice(id, { estado: 'error', mensajes_sri: JSON.stringify([{ mensaje: e.message }]) });
    const row = await getInvoice(id);
    return { invoice: row, error: e.message };
  }
  await updateInvoice(id, { estado: 'firmada', xml_firmado: signedXml });

  const row = await processWithSri(id, signedXml, built.accessKey);
  return { invoice: row };
}

// Reintento: usa el XML firmado guardado; nunca regenera secuencial ni clave.
async function retryInvoice(id) {
  const row = await getInvoice(id);
  if (!row) {
    const err = new Error('Factura no encontrada');
    err.code = 'NOT_FOUND';
    throw err;
  }
  if (row.estado === 'autorizada') return { invoice: row };
  if (!row.xml_firmado || !row.clave_acceso) {
    const err = new Error('La factura no tiene XML firmado; no se puede reintentar (emita una nueva)');
    err.code = 'NOT_RETRYABLE';
    throw err;
  }

  if (row.estado === 'recibida') {
    // Ya recibida por el SRI: solo consultar autorización
    const auth = await requestAuthorization(row.clave_acceso);
    if (auth.estado === 'AUTORIZADO') {
      await updateInvoice(id, {
        estado: 'autorizada',
        numero_autorizacion: auth.numeroAutorizacion || row.clave_acceso,
        fecha_autorizacion: parseSriDate(auth.fechaAutorizacion),
        mensajes_sri: JSON.stringify(auth.mensajes),
        xml_firmado: auth.xmlAutorizado || row.xml_firmado
      });
    } else if (auth.estado === 'NO AUTORIZADO') {
      await updateInvoice(id, { estado: 'no_autorizada', mensajes_sri: JSON.stringify(auth.mensajes) });
    } else {
      await updateInvoice(id, {
        mensajes_sri: JSON.stringify([{ mensaje: `Autorización aún pendiente (${auth.estado}).` }, ...auth.mensajes])
      });
    }
    return { invoice: await getInvoice(id) };
  }

  // firmada / devuelta / error / no_autorizada: reenviar recepción completa
  const updated = await processWithSri(id, row.xml_firmado, row.clave_acceso);
  return { invoice: updated };
}

async function listInvoices() {
  const r = await db.query(
    `SELECT id, order_id, ambiente, estab, pto_emi, secuencial, clave_acceso, estado,
            tipo_identificacion, identificacion, razon_social, direccion, email, telefono,
            items, forma_pago, subtotal, iva, total,
            numero_autorizacion, fecha_autorizacion, mensajes_sri, created_at, updated_at
     FROM invoices ORDER BY id DESC`
  );
  return r.rows;
}

function formatInvoiceNumber(row) {
  return `${row.estab}-${row.pto_emi}-${String(row.secuencial).padStart(9, '0')}`;
}

module.exports = { emitInvoice, retryInvoice, listInvoices, getInvoice, formatInvoiceNumber };
