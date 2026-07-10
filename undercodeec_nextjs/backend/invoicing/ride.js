const puppeteer = require('puppeteer');
const { getSriConfig } = require('./config');
const { IVA_RATES } = require('./invoiceBuilder');

// ============================================================================
// Code128 (SVG) para la clave de acceso — sin dependencias externas
// ============================================================================
const CODE128_WIDTHS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

function code128Values(digits) {
  // Solo dígitos: Code C en pares; si la longitud es impar, último dígito en Code B
  const values = [];
  let even = digits.length % 2 === 0 ? digits : digits.slice(0, -1);
  values.push(105); // START C
  for (let i = 0; i < even.length; i += 2) values.push(Number(even.slice(i, i + 2)));
  if (digits.length % 2 !== 0) {
    values.push(100); // CODE B
    values.push(digits.charCodeAt(digits.length - 1) - 32);
  }
  let checksum = values[0];
  for (let i = 1; i < values.length; i++) checksum += values[i] * i;
  values.push(checksum % 103);
  values.push(106); // STOP
  return values;
}

function code128Svg(digits, { height = 50, moduleWidth = 1 } = {}) {
  const values = code128Values(digits);
  let x = 0;
  let bars = '';
  values.forEach((v) => {
    const widths = CODE128_WIDTHS[v];
    for (let i = 0; i < widths.length; i++) {
      const w = Number(widths[i]) * moduleWidth;
      if (i % 2 === 0) bars += `<rect x="${x}" y="0" width="${w}" height="${height}" fill="#000"/>`;
      x += w;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="${height}" viewBox="0 0 ${x} ${height}" preserveAspectRatio="none" style="width:100%;height:${height}px">${bars}</svg>`;
}

// ============================================================================
// Plantilla HTML del RIDE (formato estándar SRI)
// ============================================================================
function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function money(n) {
  return Number(n || 0).toFixed(2);
}

const TIPO_ID_LABEL = { '04': 'RUC', '05': 'CÉDULA', '06': 'PASAPORTE', '07': 'CONSUMIDOR FINAL' };
const FORMA_PAGO_LABEL = {
  '01': 'SIN UTILIZACIÓN DEL SISTEMA FINANCIERO',
  '19': 'TARJETA DE CRÉDITO',
  '20': 'OTROS CON UTILIZACIÓN DEL SISTEMA FINANCIERO'
};

function buildRideHtml(row) {
  const cfg = getSriConfig();
  const numero = `${row.estab}-${row.pto_emi}-${String(row.secuencial).padStart(9, '0')}`;
  const items = typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []);
  const ambienteLabel = Number(row.ambiente) === 2 ? 'PRODUCCIÓN' : 'PRUEBAS';
  const fechaEmision = row.created_at ? new Date(row.created_at).toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil' }) : '';
  const fechaAut = row.fecha_autorizacion
    ? new Date(row.fecha_autorizacion).toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })
    : '';

  let subtotal15 = 0, subtotal0 = 0;
  const itemRows = items.map((it, i) => {
    const cantidad = Number(it.cantidad);
    const precio = Number(it.precioUnitario);
    const descuento = Number(it.descuento || 0);
    const base = cantidad * precio - descuento;
    const codIva = String(it.codigoPorcentajeIva ?? '4');
    if (IVA_RATES[codIva] > 0) subtotal15 += base; else subtotal0 += base;
    return `<tr>
      <td>${esc(it.codigoPrincipal || `SRV-${String(i + 1).padStart(3, '0')}`)}</td>
      <td class="num">${cantidad.toFixed(2)}</td>
      <td>${esc(it.descripcion)}</td>
      <td class="num">${money(precio)}</td>
      <td class="num">${money(descuento)}</td>
      <td class="num">${money(base)}</td>
    </tr>`;
  }).join('');

  const rimpeHtml = cfg.contribuyenteRimpe ? `<div class="box small center"><b>${esc(cfg.contribuyenteRimpe)}</b></div>` : '';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #000; padding: 18px; }
  .grid { display: flex; gap: 8px; }
  .col { flex: 1; }
  .box { border: 1px solid #000; border-radius: 6px; padding: 8px; margin-bottom: 8px; }
  .box h1 { font-size: 14px; margin-bottom: 4px; }
  .box h2 { font-size: 12px; margin-bottom: 4px; }
  .row { margin-bottom: 3px; }
  .label { font-weight: bold; }
  .center { text-align: center; }
  .small { font-size: 9px; }
  .clave { font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.5px; word-break: break-all; text-align: center; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  th, td { border: 1px solid #000; padding: 3px 5px; font-size: 9px; }
  th { background: #eee; }
  .num { text-align: right; }
  .totales { width: 45%; margin-left: auto; }
  .ambiente-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; color: #fff; background: ${Number(row.ambiente) === 2 ? '#1e7e34' : '#d9831f'}; }
</style></head>
<body>
  <div class="grid">
    <div class="col">
      <div class="box">
        <h1>${esc(cfg.nombreComercial || cfg.razonSocial)}</h1>
        <div class="row"><span class="label">Razón Social:</span> ${esc(cfg.razonSocial)}</div>
        <div class="row"><span class="label">Dirección Matriz:</span> ${esc(cfg.dirMatriz)}</div>
        <div class="row"><span class="label">Dirección Sucursal:</span> ${esc(cfg.dirMatriz)}</div>
        <div class="row"><span class="label">Obligado a llevar contabilidad:</span> ${esc(cfg.obligadoContabilidad)}</div>
      </div>
      ${rimpeHtml}
    </div>
    <div class="col">
      <div class="box">
        <div class="row"><span class="label">RUC:</span> ${esc(cfg.ruc)}</div>
        <h2>FACTURA</h2>
        <div class="row"><span class="label">No.:</span> ${esc(numero)}</div>
        <div class="row"><span class="label">NÚMERO DE AUTORIZACIÓN:</span><br>${esc(row.numero_autorizacion || 'PENDIENTE')}</div>
        <div class="row"><span class="label">Fecha y hora de autorización:</span> ${esc(fechaAut)}</div>
        <div class="row"><span class="label">Ambiente:</span> <span class="ambiente-badge">${ambienteLabel}</span></div>
        <div class="row"><span class="label">Emisión:</span> NORMAL</div>
        <div class="row"><span class="label">CLAVE DE ACCESO</span></div>
        ${row.clave_acceso ? code128Svg(row.clave_acceso) : ''}
        <div class="clave">${esc(row.clave_acceso || '')}</div>
      </div>
    </div>
  </div>

  <div class="box">
    <div class="grid">
      <div class="col">
        <div class="row"><span class="label">Razón Social / Nombres:</span> ${esc(row.razon_social)}</div>
        <div class="row"><span class="label">${esc(TIPO_ID_LABEL[row.tipo_identificacion] || 'Identificación')}:</span> ${esc(row.identificacion)}</div>
      </div>
      <div class="col">
        <div class="row"><span class="label">Fecha Emisión:</span> ${esc(fechaEmision)}</div>
        <div class="row"><span class="label">Dirección:</span> ${esc(row.direccion || 'N/A')}</div>
      </div>
    </div>
  </div>

  <table>
    <thead><tr>
      <th>Cod. Principal</th><th>Cant.</th><th>Descripción</th><th>Precio Unitario</th><th>Descuento</th><th>Precio Total</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="grid">
    <div class="col">
      <div class="box">
        <h2 class="small">Información Adicional</h2>
        ${row.email ? `<div class="row"><span class="label">Email:</span> ${esc(row.email)}</div>` : ''}
        ${row.telefono ? `<div class="row"><span class="label">Teléfono:</span> ${esc(row.telefono)}</div>` : ''}
        ${row.order_id ? `<div class="row"><span class="label">Pedido:</span> ${esc(row.order_id)}</div>` : ''}
      </div>
      <table>
        <thead><tr><th>Forma de pago</th><th>Valor</th></tr></thead>
        <tbody><tr><td>${esc(FORMA_PAGO_LABEL[row.forma_pago] || row.forma_pago)}</td><td class="num">${money(row.total)}</td></tr></tbody>
      </table>
    </div>
    <div class="col">
      <table class="totales">
        <tbody>
          <tr><td class="label">SUBTOTAL 15%</td><td class="num">${money(subtotal15)}</td></tr>
          <tr><td class="label">SUBTOTAL 0%</td><td class="num">${money(subtotal0)}</td></tr>
          <tr><td class="label">SUBTOTAL SIN IMPUESTOS</td><td class="num">${money(row.subtotal)}</td></tr>
          <tr><td class="label">IVA 15%</td><td class="num">${money(row.iva)}</td></tr>
          <tr><td class="label">VALOR TOTAL</td><td class="num"><b>${money(row.total)}</b></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</body></html>`;
}

// Genera el PDF del RIDE. `runner` permite inyectar la cola runWithPuppeteer del server.
async function generateRidePdf(row, runner = (fn) => fn()) {
  const html = buildRideHtml(row);
  return runner(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '10mm', bottom: '10mm', left: '8mm', right: '8mm' } });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  });
}

module.exports = { buildRideHtml, generateRidePdf };
