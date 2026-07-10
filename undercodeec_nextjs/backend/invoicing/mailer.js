const { getSriConfig } = require('./config');
const { formatInvoiceNumber } = require('./invoiceService');

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Envía al cliente el XML autorizado + RIDE PDF (obligación del emisor).
async function sendInvoiceEmail({ transporter, invoiceRow, ridePdfBuffer }) {
  if (!invoiceRow.email) return { sent: false, reason: 'sin email del comprador' };
  const cfg = getSriConfig();
  const numero = formatInvoiceNumber(invoiceRow);
  const esPrueba = Number(invoiceRow.ambiente) !== 2;

  const attachments = [
    { filename: `factura_${numero}.xml`, content: invoiceRow.xml_firmado || '', contentType: 'application/xml' }
  ];
  if (ridePdfBuffer) {
    attachments.push({ filename: `factura_${numero}.pdf`, content: ridePdfBuffer, contentType: 'application/pdf' });
  }

  await transporter.sendMail({
    from: `"${cfg.nombreComercial || cfg.razonSocial}" <${process.env.EMAIL_USER}>`,
    to: invoiceRow.email,
    subject: `${esPrueba ? '[PRUEBAS] ' : ''}Factura Electrónica ${numero} - ${cfg.nombreComercial || cfg.razonSocial}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #600b56;">Factura Electrónica ${esc(numero)}</h2>
        ${esPrueba ? '<p style="color:#d9831f;"><b>Documento emitido en AMBIENTE DE PRUEBAS (sin validez tributaria).</b></p>' : ''}
        <p>Estimado/a <b>${esc(invoiceRow.razon_social)}</b>,</p>
        <p>Adjuntamos tu factura electrónica autorizada por el SRI.</p>
        <p style="font-size:12px;color:#555;"><b>Número de autorización:</b><br>${esc(invoiceRow.numero_autorizacion || '')}</p>
        <p style="font-size:12px;color:#555;"><b>Total:</b> $${Number(invoiceRow.total).toFixed(2)}</p>
        <p style="font-size:11px;color:#999;">Adjuntos: RIDE (PDF) y comprobante XML.</p>
      </div>
    `,
    attachments
  });
  return { sent: true };
}

module.exports = { sendInvoiceEmail };
