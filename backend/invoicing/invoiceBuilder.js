const { generateInvoice, generateInvoiceXml } = require('open-factura');
const { getSriConfig } = require('./config');

// Tarifas IVA vigentes según tabla SRI (codigoPorcentaje -> %)
const IVA_RATES = { '0': 0, '4': 15 };

const FORMA_PAGO_MAP = {
  tarjeta: '19',       // Tarjeta de crédito
  transferencia: '20', // Otros con utilización del sistema financiero
  efectivo: '01'       // Sin utilización del sistema financiero
};

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function money(n) {
  return round2(n).toFixed(2);
}

// Fecha actual en zona horaria de Ecuador (America/Guayaquil, UTC-5 sin DST)
function getEcuadorDateParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Guayaquil',
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
  const [yyyy, mm, dd] = fmt.format(date).split('-');
  return { yyyy, mm, dd };
}

function validateComprador(comprador) {
  const errors = [];
  const tipos = ['04', '05', '06', '07'];
  if (!tipos.includes(comprador.tipoIdentificacion)) {
    errors.push(`tipoIdentificacion inválido: ${comprador.tipoIdentificacion} (use 04 RUC, 05 cédula, 06 pasaporte, 07 consumidor final)`);
  }
  const id = (comprador.identificacion || '').trim();
  if (comprador.tipoIdentificacion === '04' && !/^\d{13}$/.test(id)) {
    errors.push('RUC del comprador debe tener 13 dígitos');
  }
  if (comprador.tipoIdentificacion === '05' && !/^\d{10}$/.test(id)) {
    errors.push('Cédula del comprador debe tener 10 dígitos');
  }
  if (comprador.tipoIdentificacion === '06' && !id) {
    errors.push('Pasaporte del comprador es requerido');
  }
  if (comprador.tipoIdentificacion !== '07' && !(comprador.razonSocial || '').trim()) {
    errors.push('razonSocial del comprador es requerida');
  }
  return errors;
}

function validateItems(items) {
  const errors = [];
  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Se requiere al menos un ítem');
    return errors;
  }
  items.forEach((item, i) => {
    if (!(item.descripcion || '').trim()) errors.push(`Ítem ${i + 1}: descripción requerida`);
    const cantidad = Number(item.cantidad);
    if (!(cantidad > 0)) errors.push(`Ítem ${i + 1}: cantidad debe ser mayor a 0`);
    const precio = Number(item.precioUnitario);
    if (!(precio >= 0)) errors.push(`Ítem ${i + 1}: precioUnitario inválido`);
    const descuento = Number(item.descuento || 0);
    if (descuento < 0) errors.push(`Ítem ${i + 1}: descuento no puede ser negativo`);
    const codIva = item.codigoPorcentajeIva ?? '4';
    if (!(codIva in IVA_RATES)) errors.push(`Ítem ${i + 1}: codigoPorcentajeIva inválido (${codIva}); use '0' (0%) o '4' (15%)`);
  });
  return errors;
}

// Calcula totales y detalle por ítem a partir de items "crudos"
// items: [{ descripcion, cantidad, precioUnitario, descuento?, codigoPorcentajeIva? }]
function computeTotals(items) {
  let subtotal = 0;
  let totalDescuento = 0;
  let totalIva = 0;
  const basesPorCodigo = {}; // codigoPorcentaje -> { base, valor }

  const detalleItems = items.map((item, i) => {
    const cantidad = Number(item.cantidad);
    const precioUnitario = Number(item.precioUnitario);
    const descuento = round2(Number(item.descuento || 0));
    const codIva = String(item.codigoPorcentajeIva ?? '4');
    const tarifa = IVA_RATES[codIva];

    const base = round2(cantidad * precioUnitario - descuento);
    const valorIva = round2(base * tarifa / 100);

    subtotal = round2(subtotal + base);
    totalDescuento = round2(totalDescuento + descuento);
    totalIva = round2(totalIva + valorIva);

    if (!basesPorCodigo[codIva]) basesPorCodigo[codIva] = { base: 0, valor: 0, tarifa };
    basesPorCodigo[codIva].base = round2(basesPorCodigo[codIva].base + base);
    basesPorCodigo[codIva].valor = round2(basesPorCodigo[codIva].valor + valorIva);

    return {
      codigoPrincipal: (item.codigoPrincipal || `SRV-${String(i + 1).padStart(3, '0')}`).slice(0, 25),
      codigoAuxiliar: (item.codigoAuxiliar || `SRV-${String(i + 1).padStart(3, '0')}`).slice(0, 25),
      descripcion: item.descripcion.trim().slice(0, 300),
      cantidad: cantidad.toFixed(6),
      precioUnitario: precioUnitario.toFixed(6),
      descuento: money(descuento),
      precioTotalSinImpuesto: money(base),
      impuestos: {
        impuesto: [{
          codigo: '2', // IVA
          codigoPorcentaje: codIva,
          tarifa: tarifa.toFixed(2),
          baseImponible: money(base),
          valor: money(valorIva)
        }]
      }
    };
  });

  const totalConImpuestos = Object.entries(basesPorCodigo).map(([codigo, agg]) => ({
    codigo: '2',
    codigoPorcentaje: codigo,
    descuentoAdicional: '0.00',
    baseImponible: money(agg.base),
    tarifa: agg.tarifa.toFixed(2),
    valor: money(agg.valor)
  }));

  const total = round2(subtotal + totalIva);

  return { subtotal, totalDescuento, totalIva, total, detalleItems, totalConImpuestos };
}

/**
 * Construye la factura SRI completa (XML sin firmar + clave de acceso).
 *
 * @param {object} params
 * @param {object} params.comprador { tipoIdentificacion, identificacion, razonSocial, direccion?, email?, telefono? }
 * @param {Array}  params.items     [{ descripcion, cantidad, precioUnitario, descuento?, codigoPorcentajeIva? }]
 * @param {string} params.formaPago 'tarjeta' | 'transferencia' | 'efectivo' | código SRI directo ('19','20','01'...)
 * @param {number} params.secuencial número de secuencial a usar
 * @param {number|null} [params.orderId] id del pedido asociado (solo informativo)
 */
function buildInvoice({ comprador, items, formaPago, secuencial, orderId = null }) {
  const cfg = getSriConfig();

  // Consumidor final: el SRI exige identificación y razón social fijas
  const compradorNorm = { ...comprador };
  if (compradorNorm.tipoIdentificacion === '07') {
    compradorNorm.identificacion = '9999999999999';
    compradorNorm.razonSocial = 'CONSUMIDOR FINAL';
  }

  const errors = [...validateComprador(compradorNorm), ...validateItems(items)];
  if (errors.length) {
    const err = new Error('Datos de factura inválidos: ' + errors.join('; '));
    err.validationErrors = errors;
    throw err;
  }

  const codigoFormaPago = FORMA_PAGO_MAP[formaPago] || (/^\d{2}$/.test(String(formaPago)) ? String(formaPago) : '01');
  const { subtotal, totalDescuento, totalIva, total, detalleItems, totalConImpuestos } = computeTotals(items);
  const { yyyy, mm, dd } = getEcuadorDateParts();
  const secuencialStr = String(secuencial).padStart(9, '0');

  const infoTributaria = {
    ambiente: cfg.ambiente,
    tipoEmision: '1',
    razonSocial: cfg.razonSocial,
    nombreComercial: cfg.nombreComercial || cfg.razonSocial,
    ruc: cfg.ruc,
    codDoc: '01', // factura
    estab: cfg.estab,
    ptoEmi: cfg.ptoEmi,
    secuencial: secuencialStr,
    dirMatriz: cfg.dirMatriz
  };
  if (cfg.contribuyenteRimpe) infoTributaria.contribuyenteRimpe = cfg.contribuyenteRimpe;

  const invoiceInput = {
    infoTributaria,
    infoFactura: {
      // open-factura parsea esta fecha con new Date() para la clave de acceso:
      // yyyy/mm/dd se interpreta en hora local (sin corrimiento UTC); luego se
      // parchea al formato dd/mm/yyyy que exige el XSD del SRI.
      fechaEmision: `${yyyy}/${mm}/${dd}`,
      dirEstablecimiento: cfg.dirMatriz,
      obligadoContabilidad: cfg.obligadoContabilidad,
      tipoIdentificacionComprador: compradorNorm.tipoIdentificacion,
      razonSocialComprador: compradorNorm.razonSocial.trim().slice(0, 300),
      identificacionComprador: compradorNorm.identificacion.trim(),
      direccionComprador: (compradorNorm.direccion || 'N/A').trim().slice(0, 300),
      totalSinImpuestos: money(subtotal),
      totalDescuento: money(totalDescuento),
      totalConImpuestos: { totalImpuesto: totalConImpuestos },
      propina: '0.00',
      importeTotal: money(total),
      moneda: 'DOLAR',
      pagos: {
        pago: [{
          formaPago: codigoFormaPago,
          total: money(total),
          plazo: '0',
          unidadTiempo: 'dias'
        }]
      }
    },
    detalles: { detalle: detalleItems }
  };

  const { invoice, accessKey } = generateInvoice(invoiceInput);

  // El XSD del SRI exige fechaEmision dd/mm/yyyy
  invoice.factura.infoFactura.fechaEmision = `${dd}/${mm}/${yyyy}`;

  // generateInvoice descarta infoAdicional: inyectarla manualmente
  const camposAdicionales = [];
  if (compradorNorm.email) camposAdicionales.push({ '@nombre': 'email', '#': compradorNorm.email.trim() });
  if (compradorNorm.telefono) camposAdicionales.push({ '@nombre': 'telefono', '#': String(compradorNorm.telefono).trim() });
  if (orderId) camposAdicionales.push({ '@nombre': 'pedido', '#': String(orderId) });
  if (camposAdicionales.length) {
    invoice.factura.infoAdicional = { campoAdicional: camposAdicionales };
  }

  const xml = generateInvoiceXml(invoice);

  return {
    invoice,
    accessKey,
    xml,
    secuencial: secuencialStr,
    totals: { subtotal, totalDescuento, iva: totalIva, total },
    formaPago: codigoFormaPago,
    ambiente: cfg.ambiente,
    estab: cfg.estab,
    ptoEmi: cfg.ptoEmi,
    fechaEmision: `${dd}/${mm}/${yyyy}`
  };
}

module.exports = { buildInvoice, computeTotals, IVA_RATES, FORMA_PAGO_MAP };
