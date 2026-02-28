const orderData = {
  planName: 'Landing Page Profesional',
  planPrice: 160,
  amountPaid: 80,
  metodoPago: 'tarjeta',
  tipoPago: 'anticipo',
  tipoCliente: 'empresa',
  rucCedula: '1727155671001',
  razonSocial: 'Mi Empresa S.A.',
  email: 'test@example.com',
  telefono: '0999999999',
  callePrincipal: 'Calle Principal',
  calleSecundaria: 'Calle Secundaria',
  ciudad: 'Quito',
  provincia: 'Pichincha',
  codigoPostal: '170150',
  pais: 'Ecuador',
  businessName: 'Campaña Navideña',
  transactionId: 'TX123456789',
  // New fields
  sector: 'Otro',
  sectorOtro: 'Sector Espacial',
  domainStatus: 'necesito',
  domainName: 'miempresaespacial.com'
};

const {
  tipoCliente,
  rucCedula,
  razonSocial,
  email,
  telefono,
  callePrincipal,
  calleSecundaria,
  ciudad,
  provincia,
  codigoPostal,
  pais,
  metodoPago,
  tipoPago,
  planName,
  planPrice,
  amountPaid,
  businessName,
  transactionId,
  // Nuevos campos
  sector,
  sectorOtro,
  domainStatus,
  domainName
} = orderData;

const fechaPedido = new Date().toLocaleString('es-EC', { 
  timeZone: 'America/Guayaquil',
  dateStyle: 'full',
  timeStyle: 'short'
});

const montoPendiente = tipoPago === 'anticipo' ? (planPrice - amountPaid) : 0;

const businessEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #600b56, #efa238); color: #fff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: 600; color: #600b56; border-bottom: 2px solid #efa238; padding-bottom: 8px; margin-bottom: 15px; }
        .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }
        .info-label { font-weight: 600; color: #666; width: 40%; }
        .info-value { color: #333; width: 60%; }
        .highlight-box { background: linear-gradient(135deg, rgba(96,11,86,0.1), rgba(239,162,56,0.1)); border-left: 4px solid #efa238; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .amount { font-size: 28px; font-weight: 700; color: #600b56; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-total { background: #4CAF50; color: #fff; }
        .badge-anticipo { background: #FF9800; color: #fff; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 Nuevo Pedido Recibido</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${fechaPedido}</p>
        </div>
        <div class="content">
          <div class="highlight-box">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="margin: 0; color: #666;">Monto Recibido</p>
                <p class="amount">$${amountPaid} USD</p>
              </div>
              <span class="badge ${tipoPago === 'anticipo' ? 'badge-anticipo' : 'badge-total'}">
                ${tipoPago === 'anticipo' ? 'ANTICIPO 50%' : 'PAGO COMPLETO'}
              </span>
            </div>
            ${transactionId ? `<p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">ID Transacción: ${transactionId}</p>` : ''}
            ${montoPendiente > 0 ? `<p style="margin: 10px 0 0 0; color: #FF9800; font-weight: 600;">⚠️ Pendiente por cobrar: $${montoPendiente} USD</p>` : ''}
          </div>

          <div class="section">
            <h3 class="section-title">Datos del Cliente</h3>
            <div class="info-row"><span class="info-label">Tipo de Cliente:</span><span class="info-value">${tipoCliente === 'empresa' ? 'Empresa (Persona Jurídica)' : 'Consumidor Final'}</span></div>
            <div class="info-row"><span class="info-label">${tipoCliente === 'empresa' ? 'RUC' : 'Cédula'}:</span><span class="info-value">${rucCedula}</span></div>
            <div class="info-row"><span class="info-label">${tipoCliente === 'empresa' ? 'Razón Social' : 'Nombre'}:</span><span class="info-value">${razonSocial}</span></div>
            <div class="info-row"><span class="info-label">Email:</span><span class="info-value">${email}</span></div>
            <div class="info-row"><span class="info-label">Teléfono:</span><span class="info-value">${telefono}</span></div>
          </div>

          <div class="section">
            <h3 class="section-title">Direccion de Facturacion</h3>
            <div class="info-row"><span class="info-label">Calle Principal:</span><span class="info-value">${callePrincipal}</span></div>
            ${calleSecundaria ? `<div class="info-row"><span class="info-label">Calle Secundaria:</span><span class="info-value">${calleSecundaria}</span></div>` : ''}
            <div class="info-row"><span class="info-label">Ciudad:</span><span class="info-value">${ciudad}</span></div>
            <div class="info-row"><span class="info-label">Provincia:</span><span class="info-value">${provincia}</span></div>
            ${codigoPostal ? `<div class="info-row"><span class="info-label">Código Postal:</span><span class="info-value">${codigoPostal}</span></div>` : ''}
            <div class="info-row"><span class="info-label">País:</span><span class="info-value">${pais}</span></div>
          </div>

          <div class="section">
            <h3 class="section-title">Detalles del Pedido</h3>
            <div class="info-row"><span class="info-label">Proyecto:</span><span class="info-value">${businessName || 'No especificado'}</span></div>
            <div class="info-row"><span class="info-label">Plan:</span><span class="info-value">${planName}</span></div>
            <div class="info-row"><span class="info-label">Precio Total:</span><span class="info-value">$${planPrice} USD</span></div>
            <div class="info-row"><span class="info-label">Tipo de Pago:</span><span class="info-value">${tipoPago === 'anticipo' ? 'Anticipo (50%)' : 'Pago Total (100%)'}</span></div>
            <div class="info-row"><span class="info-label">Método de Pago:</span><span class="info-value">${metodoPago === 'tarjeta' ? 'Tarjeta de Crédito/Débito' : 'Transferencia Bancaria'}</span></div>
          </div>

          <div class="section">
            <h3 class="section-title">Detalles del Negocio</h3>
            <div class="info-row"><span class="info-label">Sector:</span><span class="info-value">${sector || 'No especificado'} ${sector === 'Otro' && sectorOtro ? `(${sectorOtro})` : ''}</span></div>
            <div class="info-row"><span class="info-label">Dominio:</span><span class="info-value">${domainStatus === 'tengo' ? 'Ya tiene dominio' : 'Necesita dominio'} ${domainStatus === 'necesito' && domainName ? `(${domainName})` : ''}</span></div>
          </div>
        </div>
        <div class="footer">
          <p>Este correo fue generado automáticamente por el sistema de pedidos de Undercodeec</p>
        </div>
      </div>
    </body>
    </html>
  `;

console.log('--- GENERATED EMAIL HTML ---');
console.log(businessEmailHtml);
