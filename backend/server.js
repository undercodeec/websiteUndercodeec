const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const OpenAI = require("openai");
require('dotenv').config();

const app = express();

// Configuración de CORS mejorada
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://undercodeec.com' 
    : ['http://localhost:8000', 'http://localhost:8001', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware para parsear JSON con límite de tamaño
app.use(express.json({ limit: '10kb' }));

// Variables de entorno
const TOKEN = process.env.PAYPHONE_TOKEN;
const STORE_ID = process.env.PAYPHONE_STORE_ID;

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuración de Nodemailer con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Email Transporter Error:', error);
  } else {
    console.log('✅ Server is ready to take our messages');
  }
});

// Middleware de logging solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint de pago
app.post('/api/create-payment', async (req, res) => {
  const { amount, planName } = req.body;

  // Validación de entrada
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Monto inválido' });
  }
  if (!planName || typeof planName !== 'string') {
    return res.status(400).json({ error: 'Nombre del plan requerido' });
  }

  // ID único con máximo 15 caracteres
  const clientTransactionId = crypto.randomBytes(8).toString('hex').substring(0, 15);

  // URL de respuesta - donde PayPhone redirigirá después del pago
  // Usamos la IP de red local detectada para asegurar que PayPhone acepte la redirección
  // IP detectada del log: 192.168.18.35
    const responseUrl = process.env.NODE_ENV === 'production'
    ? 'https://undercodeec.com/payment-result.html'
    : 'http://localhost:3000/payment-result.html'; // Changed from hardcoded IP for better local compatibility

  console.log('📤 Creating PayPhone payment link...');
  console.log('  - Amount:', amount, '(cents:', Math.round(amount * 100), ')');
  console.log('  - Plan:', planName);
  console.log('  - ClientTxId:', clientTransactionId);
  console.log('  - ResponseUrl:', responseUrl);

  try {
    const response = await axios.post(
      'https://pay.payphonetodoesposible.com/api/Links',
      {
        amount: Math.round(amount * 100),
        amountWithoutTax: Math.round(amount * 100),
        clientTransactionId,
        currency: 'USD',
        storeId: STORE_ID,
        reference: `Pago de plan: ${planName}`,
        responseUrl: responseUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    // Force log response even in production for debugging this issue
    console.log('✅ PayPhone Create Response:', JSON.stringify(response.data, null, 2));

    const paymentLink = typeof response.data === 'string' ? response.data : null;

    if (!paymentLink) {
      return res.status(500).json({ error: 'No se recibió el link de pago desde PayPhone' });
    }

    res.json({ 
      paymentUrl: paymentLink,
      clientTransactionId: clientTransactionId 
    });
  } catch (error) {
    console.error('Error al crear el link:', error.response?.data || error.message);
    
    // Respuesta de error más específica
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Timeout al conectar con PayPhone' });
    }
    if (error.response?.status === 401) {
      return res.status(500).json({ error: 'Error de autenticación con PayPhone' });
    }
    
    res.status(500).json({ error: 'Error al generar el link de pago' });
  }
});

// Endpoint para verificar estado de pago (Polling)
app.get('/api/check-payment-status/:clientTxId', async (req, res) => {
  const { clientTxId } = req.params;
  
  if (!clientTxId) {
    return res.status(400).json({ error: 'Client Transaction ID requerido' });
  }

  try {
    // Consultar estado a PayPhone usando endpoint de Venta por ID de Cliente
    // https://pay.payphonetodoesposible.com/api/Sale/ClientTransactionId/{id}
    const response = await axios.get(
      `https://pay.payphonetodoesposible.com/api/Sale/ClientTransactionId/${clientTxId}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000 
      }
    );

    const data = response.data;
    // console.log(`🔍 Polling Status [${clientTxId}]: ${data.transactionStatus}`); // Polling logs suppressed

    // Si ya está aprobado, retornamos éxito
    if (data.transactionStatus === 'Approved') {
      return res.json({ 
        success: true, 
        status: 'Approved',
        details: data 
      });
    } 
    // Si está Autorizado (Authorized), intentamos CONFIRMARLO automáticamente
    else if (data.transactionStatus === 'Authorized') {
      console.log(`⚡ Transaction Authorized. Attempting to capture (Confirm)...`);
      
      try {
        // Necesitamos el ID numérico que viene en 'data.transactionId' para confirmar
        const confirmResponse = await axios.post(
          'https://pay.payphonetodoesposible.com/api/button/V2/Confirm',
          {
            id: data.transactionId,
            clientTxId: clientTxId
          },
          {
            headers: {
              Authorization: `Bearer ${TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        console.log('✅ Auto-confirmation result:', confirmResponse.data);
        
        return res.json({ 
          success: true, 
          status: 'Approved', // Lo marcamos como aprobado para el frontend
          details: confirmResponse.data 
        });
        
      } catch (confirmError) {
        console.error('Error auto-confirming:', confirmError.message);
        return res.json({ 
          success: false, 
          status: 'Authorized',
          message: 'Pago autorizado pero falló la confirmación automática'
        });
      }
    }
    else {
      return res.json({ 
        success: false, 
        status: data.transactionStatus,
        message: 'Pago no completado aún' 
      });
    }

  } catch (error) {
    // Si da 404 es que la transacción no existe o aún no se ha procesado
    if (error.response && error.response.status === 404) {
      return res.json({ success: false, status: 'NotFound', message: 'Transacción no encontrada' });
    }
    
    console.error('Error polling PayPhone:', error.message);
    res.status(500).json({ error: 'Error verificando estado' });
  }
});

// Endpoint para confirmar pago con PayPhone y enviar correos
app.post('/api/confirm-payment', async (req, res) => {
  console.log('========================================');
  console.log('📥 /api/confirm-payment request received');
  console.log('Timestamp:', new Date().toISOString());
  
  const { id, clientTransactionId, orderData } = req.body;
  
  console.log('📋 Request body:');
  console.log('  - id:', id);
  console.log('  - clientTransactionId:', clientTransactionId);
  console.log('  - orderData:', orderData ? 'Provided' : 'Not provided');

  if (!id || !clientTransactionId) {
    console.log('❌ Error: Missing required parameters');
    return res.status(400).json({ error: 'Parámetros de confirmación incompletos' });
  }

  try {
    console.log('🔗 Calling PayPhone API to confirm payment...');
    console.log('  - URL: https://pay.payphonetodoesposible.com/api/button/V2/Confirm');
    console.log('  - Payload: { id:', parseInt(id), ', clientTxId:', clientTransactionId, '}');
    
    // Confirm payment with PayPhone
    const confirmResponse = await axios.post(
      'https://pay.payphonetodoesposible.com/api/button/V2/Confirm',
      {
        id: parseInt(id),
        clientTxId: clientTransactionId
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    console.log('📨 PayPhone API Response:');
    console.log(JSON.stringify(confirmResponse.data, null, 2));

    const { transactionStatus, transactionId, amount, clientTransactionId: txId } = confirmResponse.data;

    console.log('📊 Parsed response:');
    console.log('  - transactionStatus:', transactionStatus, transactionStatus === 3 ? '(APPROVED)' : transactionStatus === 2 ? '(CANCELLED)' : '(UNKNOWN)');
    console.log('  - transactionId:', transactionId);
    console.log('  - amount (cents):', amount, '-> $', amount / 100);

    // transactionStatus 3 = Approved, 2 = Cancelled/Rejected
    if (transactionStatus === 3) {
      console.log('✅ Pago aprobado:', transactionId);

      // If orderData was sent, send confirmation emails
      if (orderData) {
        try {
          console.log('📧 Sending confirmation emails...');
          // Update orderData with actual transaction info
          orderData.transactionId = transactionId;
          orderData.amountPaid = amount / 100; // PayPhone returns cents

          // Save to database
          await saveOrderToSupabase(orderData);

          // Send emails using the existing email logic
          await sendOrderEmailsInternal(orderData);
          console.log('✅ Correos de confirmación enviados');
        } catch (emailError) {
          console.error('❌ Error enviando correos:', emailError);
          // Don't fail the payment confirmation if email fails
        }
      } else {
        console.log('⚠️ No orderData provided, skipping email sending');
      }

      console.log('✅ Sending success response to client');
      res.json({
        success: true,
        transactionStatus,
        message: 'Pago confirmado exitosamente',
        details: {
          transactionId,
          amount: amount / 100,
          clientTransactionId: txId
        }
      });
    } else if (transactionStatus === 2) {
      console.log('❌ Payment cancelled/rejected');
      res.json({
        success: false,
        transactionStatus,
        message: 'El pago fue cancelado o rechazado'
      });
    } else {
      console.log('⚠️ Unknown transaction status:', transactionStatus);
      res.json({
        success: false,
        transactionStatus,
        message: 'Estado de transacción desconocido'
      });
    }

  } catch (error) {
    console.error('❌ Error confirmando pago:');
    console.error('  - Error message:', error.message);
    console.error('  - Error code:', error.code);
    console.error('  - Response data:', error.response?.data);
    console.error('  - Response status:', error.response?.status);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Timeout al confirmar con PayPhone' });
    }
    
    res.status(500).json({ 
      error: 'Error al confirmar pago',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Endpoint para el Chatbot
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Uso un modelo rápido y eficiente
      messages: [
        { 
          role: "system", 
          content: `Eres el asistente virtual experto de Undercodeec, una agencia de diseño web y desarrollo de software en Quito, Ecuador.
          
          Tu objetivo es ayudar a los usuarios a conocer nuestros servicios, contactarnos y resolver dudas.
          Responde siempre de manera amable, profesional y persuasiva.
          
          **Información Clave de la Empresa:**
          - **Nombre:** Undercodeec
          - **Ubicación:** Valle de los Chillos, Sangolquí, Quito, Ecuador.
          - **Teléfono / WhatsApp:** +593 979 046 329
          - **Email:** ventas@undercodeec.com, undercodeec@gmail.com
          - **Sitio Web:** https://undercodeec.com
          
          **Nuestros Servicios Principales:**
          1. **Diseño Web:** Páginas corporativas, Landing Pages, E-commerce.
          2. **Desarrollo de Software:** Sistemas a medida, facturación electrónica.
          3. **Aplicaciones Móviles:** Apps para Android e iOS.
          4. **Marketing Digital:** SEO, campañas en redes sociales.
          
          **Enlaces Importantes (Úsalos cuando el usuario pregunte por contacto o redes):**
          - **WhatsApp Directo:** https://wa.me/593979046329
          - **Facebook:** https://www.facebook.com/undercodeec
          - **Instagram:** https://www.instagram.com/undercodeec/
          
          **Precios y Planes (SÓLO da estos precios si preguntan por estos servicios específicos):**
          
          **Software para Negocios (SaaS):**
          - **Básico Operativo:** $150/mes (1 usuario, inventario básico).
          - **Negocio Establecido:** $250/mes (Hasta 5 usuarios, facturación electrónica).
          - **Ultimate:** $400/mes (Usuarios ilimitados, todo incluido).
          
          **Aplicación Móvil (App):**
          - **Plan Mensual:** $150 (Acceso continuo).
          - **Plan Premium:** $1,200 (Pago único de por vida).

          **Instrucciones de Comportamiento CRÍTICAS:**
          
          1. **Proyectos a Medida (Software, Apps, Diseños Específicos):**
             Si el usuario pregunta por un desarrollo de software personalizado, una app móvil con funciones específicas, o cualquier proyecto que NO encaje en los planes anteriores:
             - **NO des precios.**
             - **Diles EXACTAMENTE:** "Para proyectos a medida como software o aplicaciones móviles personalizadas, necesitamos entender a fondo tus requerimientos para darte un presupuesto exacto. Por favor, llena nuestro formulario brevemente explicando qué necesitas y un asesor te contactará."
             - **Facilita este enlace:** https://undercodeec.com/contacto
          
          2. **Cotizaciones:** Si insisten en un precio para algo a medida, reitera amablemente que cada proyecto es único y dirígelos al formulario o al WhatsApp.
          
          3. **Contacto:** 
             - WhatsApp: https://wa.me/593979046329
             - Redes: @undercodeec
          
          4. **Tono:** Profesional, directo pero amable. Usa emojis.` 
        },
        { role: "user", content: message }
      ],
      store: true,
    });

    res.json({ output_text: response.choices[0].message.content });
  } catch (error) {
    console.error('Error OpenAI:', error);
    res.status(500).json({ error: 'Error processing your request' });
  }
});

// Internal function to send order emails (reused by both endpoints)
async function sendOrderEmailsInternal(orderData) {
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

  // Business email HTML template
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
            ${montoPendiente > 0 ? `<p style="margin: 10px 0 0 0; color: #FF9800; font-weight: 600;">Pendiente por cobrar: $${montoPendiente} USD</p>` : ''}
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

  // Client email HTML template
  const clientEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #600b56, #efa238); color: #fff; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; }
        .header p { margin: 15px 0 0 0; opacity: 0.9; font-size: 16px; }
        .success-icon { font-size: 48px; margin-bottom: 15px; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
        .order-box { background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 20px 0; }
        .order-title { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
        .order-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .order-item:last-child { border-bottom: none; }
        .order-label { color: #666; }
        .order-value { font-weight: 600; color: #333; }
        .total-row { background: linear-gradient(135deg, rgba(96,11,86,0.1), rgba(239,162,56,0.1)); padding: 15px; border-radius: 8px; margin-top: 15px; }
        .total-amount { font-size: 24px; font-weight: 700; color: #600b56; }
        .pending-notice { background: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .pending-notice p { margin: 0; color: #E65100; }
        .contact-section { background: #f0f4f8; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; }
        .contact-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 15px; }
        .contact-item { margin: 10px 0; }
        .contact-item a { color: #600b56; text-decoration: none; font-weight: 500; }
        .whatsapp-btn { display: inline-block; background: #25D366; color: #fff; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: 600; margin-top: 10px; }
        .footer { background: #f9f9f9; padding: 25px; text-align: center; }
        .footer p { margin: 5px 0; color: #999; font-size: 13px; }
        .social-links { margin-top: 15px; }
        .social-links a { display: inline-block; margin: 0 10px; color: #600b56; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">OK</div>
          <h1>¡Pedido Confirmado!</h1>
          <p>Gracias por confiar en Undercodeec</p>
        </div>
        <div class="content">
          <p class="greeting">Hola <strong>${razonSocial}</strong>,</p>
          <p>Tu pedido ha sido recibido exitosamente. A continuación te presentamos el resumen de tu compra:</p>

          <div class="order-box">
            <div class="order-title">Resumen de tu Pedido</div>
            <div class="order-item">
              <span class="order-label">Proyecto</span>
              <span class="order-value">${businessName || 'Tu proyecto'}</span>
            </div>
            <div class="order-item">
              <span class="order-label">Plan Contratado</span>
              <span class="order-value">${planName}</span>
            </div>
            <div class="order-item">
              <span class="order-label">Precio del Plan</span>
              <span class="order-value">$${planPrice} USD</span>
            </div>
            <div class="order-item">
              <span class="order-label">Tipo de Pago</span>
              <span class="order-value">${tipoPago === 'anticipo' ? 'Anticipo (50%)' : 'Pago Total'}</span>
            </div>
            <div class="order-item">
              <span class="order-label">Método de Pago</span>
              <span class="order-value">${metodoPago === 'tarjeta' ? 'Tarjeta' : 'Transferencia'}</span>
            </div>
            ${transactionId ? `
            <div class="order-item">
              <span class="order-label">ID Transacción</span>
              <span class="order-value">${transactionId}</span>
            </div>
            ` : ''}
            <div class="total-row">
              <div class="order-item" style="border: none; padding: 0;">
                <span class="order-label" style="font-size: 16px;">Monto Pagado</span>
                <span class="total-amount">$${amountPaid} USD</span>
              </div>
            </div>
          </div>

          ${montoPendiente > 0 ? `
          <div class="pending-notice">
            <p><strong>📢 Recordatorio:</strong> Tienes un saldo pendiente de <strong>$${montoPendiente} USD</strong> que deberás pagar al momento de la entrega del proyecto.</p>
          </div>
          ` : ''}

          <div class="contact-section">
            <div class="contact-title">¿Tienes preguntas?</div>
            <div class="contact-item">📧 <a href="mailto:undercodeec@gmail.com">undercodeec@gmail.com</a></div>
            <div class="contact-item">📱 <a href="tel:+593979046329">+593 979 046 329</a></div>
            <a href="https://wa.me/593979046329?text=Hola,%20acabo%20de%20realizar%20un%20pedido%20y%20tengo%20una%20consulta" class="whatsapp-btn">💬 Escríbenos por WhatsApp</a>
          </div>

          <p style="text-align: center; color: #666;">
            Nos pondremos en contacto contigo pronto para iniciar tu proyecto.<br>
            <strong>¡Gracias por elegirnos!</strong>
          </p>
        </div>
        <div class="footer">
          <p><strong>Undercodeec</strong> - Desarrollo Web & Software</p>
          <p>© ${new Date().getFullYear()} Todos los derechos reservados</p>
          <div class="social-links">
            <a href="https://undercodeec.com">🌐 Web</a>
            <a href="https://instagram.com/undercodeec">📷 Instagram</a>
            <a href="https://facebook.com/undercodeec">📘 Facebook</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;



  console.log('📧 Preparing to send business email...');
  try {
    // Send email to business
    const businessInfo = await transporter.sendMail({
      from: `"Undercodeec Pedidos" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_BUSINESS,
      subject: `🛒 Nuevo Pedido: ${planName} - ${razonSocial}`,
      html: businessEmailHtml
    });
    console.log('✅ Business email sent:', businessInfo.messageId);
  } catch (err) {
    console.error('❌ Error sending business email:', err);
  }

  console.log('📧 Preparing to send client email...');
  try {
    // Send email to client
    const clientInfo = await transporter.sendMail({
      from: `"Undercodeec" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Confirmación de Pedido - ${planName}`,
      html: clientEmailHtml
    });
    console.log('✅ Client email sent:', clientInfo.messageId);
  } catch (err) {
    console.error('❌ Error sending client email:', err);
  }
}

// Helper to save order to Supabase
const supabase = require('./supabaseClient');

async function saveOrderToSupabase(orderData) {
  try {
    const { 
      planName, planPrice, transactionId, amountPaid, 
      metodoPago, tipoPago, voucherUrl 
    } = orderData;

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          plan_name: planName,
          amount: amountPaid || planPrice, // Use paid amount or total price
          client_info: orderData,
          payment_status: metodoPago === 'transferencia' ? 'pending' : 'approved',
          payment_method: metodoPago,
          voucher_url: voucherUrl || null,
          transaction_id: transactionId || null,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    console.log('✅ Order saved to Supabase:', data ? data[0]?.id : 'unknown ID');
    return data ? data[0] : null;

  } catch (error) {
    console.error('❌ Error saving order to Supabase:', error.message);
    // We don't throw here to avoid failing the email/response flow
    return null;
  }
}

// Endpoint para enviar correos de confirmación de pedido
app.post('/api/send-order-emails', async (req, res) => {
  const { orderData } = req.body;
  
  // Save to database first
  if (orderData) {
    await saveOrderToSupabase(orderData);
  }

  // Validar datos requeridos
  if (!orderData || !orderData.email || !orderData.razonSocial) {
    return res.status(400).json({ error: 'Datos del pedido incompletos' });
  }

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
    businessName
  } = orderData;

  const fechaPedido = new Date().toLocaleString('es-EC', { 
    timeZone: 'America/Guayaquil',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const montoPendiente = tipoPago === 'anticipo' ? (planPrice - amountPaid) : 0;

  // ============ EMAIL AL NEGOCIO ============
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
            ${montoPendiente > 0 ? `<p style="margin: 10px 0 0 0; color: #FF9800; font-weight: 600;">⚠️ Pendiente por cobrar: $${montoPendiente} USD</p>` : ''}
          </div>

          <div class="section">
            <h3 class="section-title">📋 Datos del Cliente</h3>
            <div class="info-row"><span class="info-label">Tipo de Cliente:</span><span class="info-value">${tipoCliente === 'empresa' ? 'Empresa (Persona Jurídica)' : 'Consumidor Final'}</span></div>
            <div class="info-row"><span class="info-label">${tipoCliente === 'empresa' ? 'RUC' : 'Cédula'}:</span><span class="info-value">${rucCedula}</span></div>
            <div class="info-row"><span class="info-label">${tipoCliente === 'empresa' ? 'Razón Social' : 'Nombre'}:</span><span class="info-value">${razonSocial}</span></div>
            <div class="info-row"><span class="info-label">Email:</span><span class="info-value">${email}</span></div>
            <div class="info-row"><span class="info-label">Teléfono:</span><span class="info-value">${telefono}</span></div>
          </div>

          <div class="section">
            <h3 class="section-title">📍 Dirección de Facturación</h3>
            <div class="info-row"><span class="info-label">Calle Principal:</span><span class="info-value">${callePrincipal}</span></div>
            ${calleSecundaria ? `<div class="info-row"><span class="info-label">Calle Secundaria:</span><span class="info-value">${calleSecundaria}</span></div>` : ''}
            <div class="info-row"><span class="info-label">Ciudad:</span><span class="info-value">${ciudad}</span></div>
            <div class="info-row"><span class="info-label">Provincia:</span><span class="info-value">${provincia}</span></div>
            ${codigoPostal ? `<div class="info-row"><span class="info-label">Código Postal:</span><span class="info-value">${codigoPostal}</span></div>` : ''}
            <div class="info-row"><span class="info-label">País:</span><span class="info-value">${pais}</span></div>
          </div>

          <div class="section">
            <h3 class="section-title">💳 Detalles del Pedido</h3>
            <div class="info-row"><span class="info-label">Proyecto:</span><span class="info-value">${businessName || 'No especificado'}</span></div>
            <div class="info-row"><span class="info-label">Plan:</span><span class="info-value">${planName}</span></div>
            <div class="info-row"><span class="info-label">Precio Total:</span><span class="info-value">$${planPrice} USD</span></div>
            <div class="info-row"><span class="info-label">Tipo de Pago:</span><span class="info-value">${tipoPago === 'anticipo' ? 'Anticipo (50%)' : 'Pago Total (100%)'}</span></div>
            <div class="info-row"><span class="info-label">Método de Pago:</span><span class="info-value">${metodoPago === 'tarjeta' ? 'Tarjeta de Crédito/Débito' : 'Transferencia Bancaria'}</span></div>
          </div>
        </div>
        <div class="footer">
          <p>Este correo fue generado automáticamente por el sistema de pedidos de Undercodeec</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // ============ EMAIL AL CLIENTE ============
  const clientEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #600b56, #efa238); color: #fff; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; }
        .header p { margin: 15px 0 0 0; opacity: 0.9; font-size: 16px; }
        .success-icon { font-size: 48px; margin-bottom: 15px; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
        .order-box { background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 20px 0; }
        .order-title { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
        .order-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .order-item:last-child { border-bottom: none; }
        .order-label { color: #666; }
        .order-value { font-weight: 600; color: #333; }
        .total-row { background: linear-gradient(135deg, rgba(96,11,86,0.1), rgba(239,162,56,0.1)); padding: 15px; border-radius: 8px; margin-top: 15px; }
        .total-amount { font-size: 24px; font-weight: 700; color: #600b56; }
        .pending-notice { background: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .pending-notice p { margin: 0; color: #E65100; }
        .contact-section { background: #f0f4f8; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center; }
        .contact-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 15px; }
        .contact-item { margin: 10px 0; }
        .contact-item a { color: #600b56; text-decoration: none; font-weight: 500; }
        .whatsapp-btn { display: inline-block; background: #25D366; color: #fff; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: 600; margin-top: 10px; }
        .footer { background: #f9f9f9; padding: 25px; text-align: center; }
        .footer p { margin: 5px 0; color: #999; font-size: 13px; }
        .social-links { margin-top: 15px; }
        .social-links a { display: inline-block; margin: 0 10px; color: #600b56; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">OK</div>
          <h1>¡Pedido Confirmado!</h1>
          <p>Gracias por confiar en Undercodeec</p>
        </div>
        <div class="content">
          <p class="greeting">Hola <strong>${razonSocial}</strong>,</p>
          <p>Tu pedido ha sido recibido exitosamente. A continuación te presentamos el resumen de tu compra:</p>

          <div class="order-box">
            <div class="order-title">Resumen de tu Pedido</div>
            <div class="order-item">
              <span class="order-label">Proyecto</span>
              <span class="order-value">${businessName || 'Tu proyecto'}</span>
            </div>
            <div class="order-item">
              <span class="order-label">Plan Contratado</span>
              <span class="order-value">${planName}</span>
            </div>
            <div class="order-item">
              <span class="order-label">Precio del Plan</span>
              <span class="order-value">$${planPrice} USD</span>
            </div>
            <div class="order-item">
              <span class="order-label">Tipo de Pago</span>
              <span class="order-value">${tipoPago === 'anticipo' ? 'Anticipo (50%)' : 'Pago Total'}</span>
            </div>
            <div class="order-item">
              <span class="order-label">Método de Pago</span>
              <span class="order-value">${metodoPago === 'tarjeta' ? 'Tarjeta' : 'Transferencia'}</span>
            </div>
            <div class="total-row">
              <div class="order-item" style="border: none; padding: 0;">
                <span class="order-label" style="font-size: 16px;">Monto Pagado</span>
                <span class="total-amount">$${amountPaid} USD</span>
              </div>
            </div>
          </div>

          ${montoPendiente > 0 ? `
          <div class="pending-notice">
            <p><strong>Recordatorio:</strong> Tienes un saldo pendiente de <strong>$${montoPendiente} USD</strong> que deberás pagar al momento de la entrega del proyecto.</p>
          </div>
          ` : ''}

          <div class="contact-section">
            <div class="contact-title">¿Tienes preguntas?</div>
             <div class="contact-item"><a href="mailto:undercodeec@gmail.com">undercodeec@gmail.com</a></div>
            <div class="contact-item"><a href="tel:+593979046329">+593 979 046 329</a></div>
            <a href="https://wa.me/593979046329?text=Hola,%20acabo%20de%20realizar%20un%20pedido%20y%20tengo%20una%20consulta" class="whatsapp-btn">Escríbenos por WhatsApp</a>
          </div>

          <p style="text-align: center; color: #666;">
            Nos pondremos en contacto contigo pronto para iniciar tu proyecto.<br>
            <strong>¡Gracias por elegirnos!</strong>
          </p>
        </div>
        <div class="footer">
          <p><strong>Undercodeec</strong> - Desarrollo Web & Software</p>
          <p>© ${new Date().getFullYear()} Todos los derechos reservados</p>
          <div class="social-links">
            <a href="https://undercodeec.com">Web</a>
            <a href="https://instagram.com/undercodeec">Instagram</a>
            <a href="https://facebook.com/undercodeec">Facebook</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // Enviar correo al negocio
    await transporter.sendMail({
      from: `"Undercodeec Pedidos" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_BUSINESS,
      subject: `Nuevo Pedido: ${planName} - ${razonSocial}`,
      html: businessEmailHtml
    });

    console.log('✅ Email enviado al negocio');

    // Enviar correo al cliente
    await transporter.sendMail({
      from: `"Undercodeec" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Confirmación de Pedido - ${planName}`,
      html: clientEmailHtml
    });

    console.log('✅ Email enviado al cliente:', email);

    res.json({ success: true, message: 'Correos enviados exitosamente' });

  } catch (error) {
    console.error('Error enviando correos:', error);
    res.status(500).json({ 
      error: 'Error al enviar correos',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Endpoint para enviar solicitud de desarrollo de software
app.post('/api/send-software-request', async (req, res) => {
  const { 
    softwareEscala, 
    softwareRoles, 
    softwareIntegraciones, 
    softwarePresupuesto, 
    softwareTiempo, 
    softwareNombre, 
    softwareEmail, 
    softwareTelefono, 
    recaptchaToken 
  } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ error: 'ReCAPTCHA token requerido' });
  }

  try {
    // 1. Verificar ReCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        console.error('RECAPTCHA_SECRET_KEY no configurado');
        return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
    
    const recaptchaResponse = await axios.post(verificationUrl);
    const { success } = recaptchaResponse.data;

    // Note: strict check for success. Google response might have error-codes.
    if (!success) {
      console.error('ReCAPTCHA falló:', recaptchaResponse.data);
      return res.status(400).json({ error: 'Verificación de ReCAPTCHA fallida' });
    }

    // 2. Enviar correo al administrador
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
          .container { background: #fff; padding: 30px; border-radius: 8px; max-width: 600px; margin: auto; }
          h2 { color: #600b56; border-bottom: 2px solid #efa238; padding-bottom: 10px; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; margin-bottom: 10px; display: block; }
          .section { margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🚀 Nueva Solicitud de Desarrollo de Software</h2>
          <p>Se ha recibido una nueva solicitud a través del formulario web.</p>
          
          <div class="section">
            <span class="label">Cliente:</span>
            <span class="value">${softwareNombre}</span>
            
            <span class="label">Email:</span>
            <span class="value">${softwareEmail}</span>
            
            <span class="label">Teléfono:</span>
            <span class="value">${softwareTelefono}</span>
          </div>

          <div class="section">
            <h3>Detalles del Proyecto</h3>
            
            <span class="label">Escala del Proyecto:</span>
            <span class="value">${softwareEscala}</span>
            
            <span class="label">Roles de Usuario:</span>
            <span class="value">${Array.isArray(softwareRoles) ? softwareRoles.join(', ') : softwareRoles}</span>
            
            <span class="label">Integraciones:</span>
            <span class="value">${Array.isArray(softwareIntegraciones) ? softwareIntegraciones.join(', ') : softwareIntegraciones}</span>
            
            <span class="label">Presupuesto Estimado:</span>
            <span class="value">${softwarePresupuesto}</span>
            
            <span class="label">Tiempo de Entrega:</span>
            <span class="value">${softwareTiempo}</span>
          </div>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            Este correo fue generado automáticamente por el sistema de Undercodeec.
          </p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Undercodeec Software" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_BUSINESS || process.env.EMAIL_USER,
      subject: `💻 Nueva Solicitud de Software: ${softwareNombre}`,
      html: adminEmailHtml
    });

    res.json({ success: true, message: 'Solicitud enviada correctamente' });

  } catch (error) {
    console.error('Error procesando solicitud de software:', error);
    res.status(500).json({ error: 'Error interno al procesar la solicitud' });
  }
});

// Endpoint para enviar solicitud de Aplicación Web
app.post('/api/send-webapp-request', async (req, res) => {
  const { 
    appWebObjetivo,
    appWebObjetivoDetalle,
    appWebMobile,
    appWebDescripcion,
    appWebUsuarios,
    appWebRoles,
    appWebRolesDetalle,
    appWebReportes,
    businessName, // Nombre del proyecto/app
    sector,
    domainStatus,
    
    // Contacto
    contactName,
    contactEmail,
    contactPhone,
    
    recaptchaToken 
  } = req.body;

  // ReCAPTCHA verification (optional but recommended, currently disabled to simplify flow if token not passed)
  // If you want to enable it, pass recaptchaToken from frontend
  /*
  if (!recaptchaToken) {
    return res.status(400).json({ error: 'ReCAPTCHA token requerido' });
  }
  */

  try {
     // 1. Enviar correo al administrador
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
          .container { background: #fff; padding: 30px; border-radius: 8px; max-width: 600px; margin: auto; }
          h2 { color: #02b5ff; border-bottom: 2px solid #0c3df4; padding-bottom: 10px; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; margin-bottom: 10px; display: block; }
          .section { margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; }
          .section h3 { font-size: 16px; color: #333; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🌐 Nueva Solicitud de App Web</h2>
          <p>Se ha recibido una nueva solicitud a través del formulario web.</p>
          
          <div class="section">
            <h3>👤 Datos de Contacto</h3>
            <span class="label">Nombre:</span>
            <span class="value">${contactName}</span>
            
            <span class="label">Email:</span>
            <span class="value">${contactEmail}</span>
            
            <span class="label">Teléfono:</span>
            <span class="value">${contactPhone}</span>
          </div>

          <div class="section">
            <h3>🏢 Identidad del Proyecto</h3>
            <span class="label">Nombre App / Proyecto:</span>
            <span class="value">${businessName}</span>

            <span class="label">Sector:</span>
            <span class="value">${sector}</span>

            <span class="label">Dominio:</span>
            <span class="value">${domainStatus === 'tengo' ? 'Tiene dominio' : 'Necesita dominio'}</span>
          </div>

          <div class="section">
             <h3>⚙️ Detalles Técnicos</h3>

             <span class="label">Objetivo Principal:</span>
             <span class="value">${appWebObjetivo} ${appWebObjetivo === 'otros' ? `(${appWebObjetivoDetalle})` : ''}</span>

             <span class="label">Compatibilidad Móvil:</span>
             <span class="value">${appWebMobile}</span>

             <span class="label">Descripción:</span>
             <span class="value">${appWebDescripcion}</span>
          </div>

          <div class="section">
             <h3>👥 Usuarios y Roles</h3>
             
             <span class="label">Cantidad Estimada:</span>
             <span class="value">${appWebUsuarios}</span>

             <span class="label">Roles Requeridos:</span>
             <span class="value">${Array.isArray(appWebRoles) ? appWebRoles.join(', ') : appWebRoles} ${appWebRoles.includes('otros') ? `(${appWebRolesDetalle})` : ''}</span>

             <span class="label">Reportes:</span>
             <span class="value">${appWebReportes}</span>
          </div>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            Este correo fue generado automáticamente por el sistema de Undercodeec.
          </p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Undercodeec WebApp" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_BUSINESS || process.env.EMAIL_USER,
      subject: `🌐 Nueva App Web: ${businessName} - ${contactName}`,
      html: adminEmailHtml
    });

    res.json({ success: true, message: 'Solicitud enviada correctamente' });

  } catch (error) {
    console.error('Error procesando solicitud de app web:', error);
    res.status(500).json({ error: 'Error interno al procesar la solicitud' });
  }
});

// Endpoint para enviar solicitud de Aplicación Móvil
app.post('/api/send-mobileapp-request', async (req, res) => {
  const { 
    appMobilePlataforma,
    appMobileTipo,
    appMobileFuncionalidades,
    appMobilePublicacion,
    businessName, // Nombre de la App
    sector,
    domainStatus, // Sitio web actual status
    
    // Contacto
    contactName,
    contactEmail,
    contactPhone,
    
    recaptchaToken 
  } = req.body;

  try {
     // 1. Enviar correo al administrador
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
          .container { background: #fff; padding: 30px; border-radius: 8px; max-width: 600px; margin: auto; }
          h2 { color: #38bdf8; border-bottom: 2px solid #0284c7; padding-bottom: 10px; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; margin-bottom: 10px; display: block; }
          .section { margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; }
          .section h3 { font-size: 16px; color: #333; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>📱 Nueva Solicitud de App Móvil</h2>
          <p>Se ha recibido una nueva solicitud a través del formulario web.</p>
          
          <div class="section">
            <h3>👤 Datos de Contacto</h3>
            <span class="label">Nombre:</span>
            <span class="value">${contactName}</span>
            
            <span class="label">Email:</span>
            <span class="value">${contactEmail}</span>
            
            <span class="label">Teléfono:</span>
            <span class="value">${contactPhone}</span>
          </div>

          <div class="section">
            <h3>🏢 Identidad de la App</h3>
            <span class="label">Nombre App:</span>
            <span class="value">${businessName}</span>

            <span class="label">Categoría/Sector:</span>
            <span class="value">${sector}</span>

            <span class="label">Sitio Web Actual:</span>
            <span class="value">${domainStatus === 'tengo' ? 'Quieren convertir sitio existente' : 'Proyecto nuevo'}</span>
          </div>

          <div class="section">
             <h3>⚙️ Detalles Técnicos</h3>

             <span class="label">Plataforma (SO):</span>
             <span class="value">${appMobilePlataforma === 'android' ? 'Solo Android' : appMobilePlataforma === 'ios' ? 'Solo iOS' : 'Ambos (Android + iOS)'}</span>

             <span class="label">Tipo de App:</span>
             <span class="value">${appMobileTipo}</span>

             <span class="label">Funcionalidades Críticas:</span>
             <span class="value">${Array.isArray(appMobileFuncionalidades) ? appMobileFuncionalidades.join(', ') : appMobileFuncionalidades}</span>

             <span class="label">Publicación en Tiendas:</span>
             <span class="value">${appMobilePublicacion === 'ayuda' ? 'Necesita ayuda para publicar' : 'Ya tiene cuentas de desarrollador'}</span>
          </div>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            Este correo fue generado automáticamente por el sistema de Undercodeec.
          </p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Undercodeec MobileApp" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_BUSINESS || process.env.EMAIL_USER,
      subject: `📱 Nueva App Móvil: ${businessName} - ${contactName}`,
      html: adminEmailHtml
    });

    res.json({ success: true, message: 'Solicitud enviada correctamente' });

  } catch (error) {
    console.error('Error procesando solicitud de app móvil:', error);
    res.status(500).json({ error: 'Error interno al procesar la solicitud' });
  }
});

// Endpoint para enviar solicitud de Moodle (Institucional/A Medida)
app.post('/api/send-moodle-request', async (req, res) => {
  const { 
    moodleUso,
    moodleUsuarios,
    moodleClases,
    moodleDiseno,
    
    businessName, // Nombre Institución
    sector,
    domainStatus, 
    
    // Contacto
    contactName,
    contactEmail,
    contactPhone,
    
    recaptchaToken 
  } = req.body;

  try {
     // 1. Enviar correo al administrador
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
          .container { background: #fff; padding: 30px; border-radius: 8px; max-width: 600px; margin: auto; }
          h2 { color: #f97316; border-bottom: 2px solid #ea580c; padding-bottom: 10px; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; margin-bottom: 10px; display: block; }
          .section { margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; }
          .section h3 { font-size: 16px; color: #333; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🎓 Nueva Solicitud Moodle (Institucional)</h2>
          <p>Se ha recibido una solicitud de cotización para plataforma LMS.</p>
          
          <div class="section">
            <h3>👤 Datos de Contacto</h3>
            <span class="label">Nombre:</span>
            <span class="value">${contactName}</span>
            
            <span class="label">Email:</span>
            <span class="value">${contactEmail}</span>
            
            <span class="label">Teléfono:</span>
            <span class="value">${contactPhone}</span>
          </div>

          <div class="section">
            <h3>🏢 Identidad Institucional</h3>
            <span class="label">Institución:</span>
            <span class="value">${businessName}</span>

            <span class="label">Sector:</span>
            <span class="value">${sector}</span>

            <span class="label">Dominio:</span>
            <span class="value">${domainStatus === 'tengo' ? 'Ya tiene dominio' : 'Necesita dominio'}</span>
          </div>

          <div class="section">
             <h3>⚙️ Detalles Técnicos</h3>

             <span class="label">Uso Principal:</span>
             <span class="value">${moodleUso}</span>

             <span class="label">Usuarios Simultáneos:</span>
             <span class="value">${moodleUsuarios === 'bajo' ? '< 50' : moodleUsuarios === 'medio' ? '50 - 200' : '> 200 (Alto)'}</span>

             <span class="label">Tipo de Clases:</span>
             <span class="value">${moodleClases === 'asincronicas' ? 'Asincrónicas (Archivos/Videos)' : 'En Vivo (Zoom/Teams)'}</span>

             <span class="label">Diseño Visual:</span>
             <span class="value">${moodleDiseno === 'estandar' ? 'Tema Estándar' : 'Diseño a Medida'}</span>
          </div>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            Este correo fue generado automáticamente por el sistema de Undercodeec.
          </p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Undercodeec Moodle" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_BUSINESS || process.env.EMAIL_USER,
      subject: `🎓 Cotización Moodle: ${businessName} - ${contactName}`,
      html: adminEmailHtml
    });

    res.json({ success: true, message: 'Solicitud enviada correctamente' });

  } catch (error) {
    console.error('Error procesando solicitud de Moodle:', error);
    res.status(500).json({ error: 'Error interno al procesar la solicitud' });
  }
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  } else {
    console.log(`Servidor iniciado en puerto ${PORT}`);
  }
});
