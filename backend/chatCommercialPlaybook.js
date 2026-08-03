function normalizeChatText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const WHATSAPP_NUMBER = '593979046329';
const SALES_HOURS_TEXT = 'Ventas atiende por WhatsApp de 8:00 AM a 22:00 PM, hora Ecuador.';

const WEB_SEASONAL_DISCOUNTS_TEXT = 'Ahora mismo hay descuentos de temporada en planes web hasta finales de julio: Landing Page con 68% de descuento, Sitio Web con 67% y Tienda Online con 55%.';

const DISCOUNTED_WEB_PRICE_SUMMARY = {
  landing: { from: 80, originalFrom: 250, discount: 68 },
  website: { from: 120, originalFrom: 360, discount: 67 },
  ecommerce: { from: 248, originalFrom: 550, discount: 55 },
};

const WHATSAPP_COPY_BY_INTENT = {
  landing: 'Hola, vengo del asistente IA de Undercodeec. Quiero cotizar una pagina web o landing page. Mi nombre es {NOMBRE} y mi proyecto es: {TIPO_PROYECTO}.',
  website: 'Hola, vengo del asistente IA de Undercodeec. Quiero cotizar un sitio web corporativo para mi negocio. Mi nombre es {NOMBRE}. Tipo de proyecto: {TIPO_PROYECTO}.',
  ecommerce: 'Hola, vengo del asistente IA de Undercodeec. Quiero cotizar una tienda online. Mi nombre es {NOMBRE}. Tipo de productos o negocio: {TIPO_PROYECTO}.',
  software: 'Hola, vengo del asistente IA de Undercodeec. Quiero hablar sobre un software, app o sistema a medida. Mi nombre es {NOMBRE}. Tipo de proyecto: {TIPO_PROYECTO}.',
  seo_marketing: 'Hola, vengo del asistente IA de Undercodeec. Quiero informacion sobre SEO, marketing digital o anuncios. Mi nombre es {NOMBRE}. Objetivo: {TIPO_PROYECTO}.',
  redesign: 'Hola, vengo del asistente IA de Undercodeec. Necesito mejorar o redisenar mi sitio web actual. Mi nombre es {NOMBRE}. Detalle del proyecto: {TIPO_PROYECTO}.',
  general: 'Hola, vengo del asistente IA de Undercodeec. Quiero que un asesor me ayude con mi proyecto. Mi nombre es {NOMBRE}. Tipo de proyecto: {TIPO_PROYECTO}.',
};

function buildWhatsAppUrl(intent = 'general', data = {}) {
  const template = WHATSAPP_COPY_BY_INTENT[intent] || WHATSAPP_COPY_BY_INTENT.general;
  const text = template
    .replace('{NOMBRE}', data.name || 'No indicado')
    .replace('{TIPO_PROYECTO}', data.projectType || 'Consulta general');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function classifyCommercialIntent(input = {}) {
  const text = normalizeChatText(input.message || input);

  if (!text) {
    return { intent: 'unknown', stage: 'exploration', leadScoreDelta: 0, shouldAskForLead: false, shouldOfferPayment: false };
  }

  if (/\b(quiero empezar|empecemos|acepto|generame|generar link|link de pago|como pago|pagar|iniciar proyecto)\b/.test(text)) {
    return { intent: 'purchase_ready', stage: 'closing', leadScoreDelta: 50, shouldAskForLead: false, shouldOfferPayment: true };
  }

  if (/\b(seo|posicionamiento|aparecer en google|google ads|sem|meta ads|facebook ads|instagram ads|marketing digital|campana|campanas|anuncios|publicidad|redes sociales)\b/.test(text)) {
    return { intent: 'seo_marketing', stage: 'diagnosis', leadScoreDelta: 20, shouldAskForLead: true, shouldOfferPayment: false };
  }

  if (/\b(whatsapp|asesor|humano|contacto|telefono|llamar)\b/.test(text)) {
    return { intent: 'human_handoff', stage: 'handoff', leadScoreDelta: 25, shouldAskForLead: true, shouldOfferPayment: false };
  }

  if (/\b(precio|precios|cuanto cuesta|cuanto vale|planes|tarifa|costo|costos|presupuesto)\b/.test(text)) {
    return { intent: 'faq_price', stage: 'exploration', leadScoreDelta: 10, shouldAskForLead: false, shouldOfferPayment: false };
  }

  if (/\b(tienda|ecommerce|e-commerce|vender productos|carrito|checkout|catalogo|pasarela)\b/.test(text)) {
    return { intent: 'ecommerce', stage: 'diagnosis', leadScoreDelta: 20, shouldAskForLead: true, shouldOfferPayment: false };
  }

  if (/\b(software|sistema|app|aplicacion|erp|crm|reservas|inventario|facturacion|saas|plataforma|moodle|curso|cursos)\b/.test(text)) {
    return { intent: 'custom_software', stage: 'diagnosis', leadScoreDelta: 25, shouldAskForLead: true, shouldOfferPayment: false };
  }

  if (/\b(redisen|redisenar|actualizar|modernizar|mejorar mi web|mejorar mi pagina|cambiar mi web|sitio actual|web actual)\b/.test(text)) {
    return { intent: 'redesign', stage: 'diagnosis', leadScoreDelta: 20, shouldAskForLead: true, shouldOfferPayment: false };
  }

  if (/\b(landing|pagina web|pagina|web|sitio web|corporativo|presencia online)\b/.test(text)) {
    return { intent: 'new_project', stage: 'diagnosis', leadScoreDelta: 15, shouldAskForLead: true, shouldOfferPayment: false };
  }

  return { intent: 'exploring', stage: 'exploration', leadScoreDelta: 0, shouldAskForLead: false, shouldOfferPayment: false };
}

function getLeadTemperature(score = 0) {
  const value = Number(score) || 0;
  if (value >= 71) return 'hot';
  if (value >= 46) return 'qualified';
  if (value >= 21) return 'interested';
  return 'cold';
}

function getCommercialNextAction(intent, temperature) {
  if (intent === 'purchase_ready') return 'Preparar datos para pago solo si el usuario confirma inicio.';
  if (intent === 'human_handoff') return 'Contactar por WhatsApp con contexto de la conversacion.';
  if (intent === 'seo_marketing') return 'Pedir web actual, mercado objetivo y si busca SEO organico, anuncios o ambos.';
  if (intent === 'custom_software') return 'Derivar a ventas para levantamiento de requerimientos.';
  if (intent === 'redesign') return 'Pedir tecnologia, accesos y alcance de cambios.';
  if (temperature === 'qualified' || temperature === 'hot') return 'Capturar nombre, WhatsApp y tipo de proyecto.';
  return 'Continuar diagnostico con una pregunta de negocio.';
}

function getLikelyService(intent) {
  const map = {
    seo_marketing: 'SEO / Marketing digital',
    ecommerce: 'Tienda online',
    custom_software: 'Software / App a medida',
    redesign: 'Rediseno o mejora web',
    new_project: 'Web / Landing / Sitio corporativo',
    faq_price: 'Por definir',
    human_handoff: 'Consulta comercial',
    purchase_ready: 'Proyecto estandar listo para cierre',
  };
  return map[intent] || 'Por definir';
}

function buildCommercialSnapshot(message, extra = {}) {
  const commercial = classifyCommercialIntent(message);
  const text = normalizeChatText(message);
  const signalScore =
    (/https?:\/\/|www\./i.test(String(message || '')) ? 20 : 0) +
    (/\b(presupuesto|budget|\$\s?\d+|\d+\s?(usd|dolares|dolares|mensuales))\b/.test(text) ? 20 : 0) +
    (/\b(urgente|rapido|esta semana|este mes|lo antes posible|fecha|plazo)\b/.test(text) ? 15 : 0) +
    (/\b(captar clientes|mas clientes|vender mas|whatsapp|aparecer en google)\b/.test(text) ? 20 : 0);
  const leadScore = Math.min(100, Math.max(0, (Number(extra.baseScore) || 0) + commercial.leadScoreDelta + signalScore + (Number(extra.extraScore) || 0)));
  const temperature = getLeadTemperature(leadScore);
  return {
    intent: commercial.intent,
    stage: commercial.stage,
    leadScore,
    temperature,
    likelyService: extra.likelyService || getLikelyService(commercial.intent),
    nextAction: extra.nextAction || getCommercialNextAction(commercial.intent, temperature),
    shouldAskForLead: !!commercial.shouldAskForLead,
    shouldOfferPayment: !!commercial.shouldOfferPayment,
  };
}

function getStaticChatReply(message, history = []) {
  const text = normalizeChatText(message);
  if (!text || text === 'saludo_inicial') return null;

  // Cuenta los turnos del usuario (incluye el mensaje actual). En el primer
  // toque respondemos con plantillas para ahorrar tokens; en seguimiento
  // (>1) delegamos las intenciones consultivas al modelo, que si conoce el
  // historial y evita repetir bloques o ignorar el contexto ya entregado.
  const userTurns = Array.isArray(history)
    ? history.filter((m) => m && m.role === 'user').length
    : 0;
  const isFollowUp = userTurns > 1;

  const commercial = classifyCommercialIntent(text);

  if (commercial.intent === 'purchase_ready') {
    return null;
  }

  // En seguimiento, lo conversacional (precio, SEO/marketing, handoff) lo
  // maneja el modelo con contexto. Evita el volcado repetido de rangos.
  if (isFollowUp && ['faq_price', 'seo_marketing', 'human_handoff'].includes(commercial.intent)) {
    return null;
  }

  if (commercial.intent === 'human_handoff') {
    return `Claro. Puedes hablar con ventas por WhatsApp para revisar tu proyecto con contexto. ${SALES_HOURS_TEXT}\n\nPara avanzar mas rapido, envia tu nombre, WhatsApp y tipo de proyecto.\n\n[wa-button]Hablar con ventas:(${buildWhatsAppUrl('general')})`;
  }

  if (commercial.intent === 'seo_marketing') {
    return 'Si, trabajamos SEO, SEM y marketing digital. En SEO no conviene dar un precio cerrado sin revisar objetivo, competencia y estado actual de la web.\n\nComo referencia publica, SEO basico inicia desde $50 mensuales. Tambien existe configuracion unica desde $50 si solo necesitas dejar la base tecnica lista sin mensualidad.\n\nPara orientarte bien: ya tienes pagina web publicada y quieres SEO organico, anuncios pagados o ambos?\n\n[wa-button]Consultar SEO o marketing:(' + buildWhatsAppUrl('seo_marketing') + ')';
  }

  if (commercial.intent === 'faq_price') {
    return `Depende de lo que quieras lograr, por eso no te lanzo toda la lista de una vez. Como referencia, ahora hay descuentos de temporada y una landing puede iniciar desde $${DISCOUNTED_WEB_PRICE_SUMMARY.landing.from}.\n\nPara no recomendarte algo que no necesitas: buscas captar contactos por WhatsApp, presentar tu negocio con varias secciones, vender productos online o mejorar tu posicionamiento en Google?\n\n[wa-button]Cotizar por WhatsApp:(${buildWhatsAppUrl('general')})`;
  }

  if (/\b(portafolio|trabajos|ejemplos|proyectos|casos)\b/.test(text)) {
    return 'Puedes revisar ejemplos y secciones de nuestro trabajo en https://undercodeec.com. Si quieres, ventas tambien puede enviarte referencias segun tu sector.\n\nQue tipo de proyecto quieres comparar: web, tienda online, software, app o SEO/marketing?\n\n[wa-button]Pedir ejemplos por WhatsApp:(' + buildWhatsAppUrl('general', { projectType: 'Quiero ver ejemplos de trabajos segun mi sector' }) + ')';
  }

  if (/\b(pago|pagos|anticipo|tarjeta|diferido|financiamiento|credito)\b/.test(text)) {
    return 'Manejamos 50% de anticipo para iniciar y el saldo segun el acuerdo del proyecto. Tambien hay pagos al contado o diferidos a 3, 6 o 12 meses con tarjeta de credito, con intereses del banco.\n\nSi ya tienes claro el servicio que quieres iniciar, puedo ayudarte a preparar los datos. Si aun estas evaluando, mejor revisamos primero tu necesidad.\n\n[wa-button]Consultar forma de pago:(' + buildWhatsAppUrl('general', { projectType: 'Quiero consultar formas de pago para mi proyecto' }) + ')';
  }

  if (/\b(hosting|dominio|garantia|soporte|mantenimiento)\b/.test(text)) {
    return 'En los planes web base normalmente incluimos dominio, hosting, SSL, correos corporativos y soporte inicial segun el alcance. Para mantenimiento mensual o soporte extendido se cotiza segun frecuencia de cambios, criticidad y tecnologia del sitio.\n\nTienes una web nueva por crear o buscas soporte para una web existente?';
  }

  if (/\b(horario|atienden|atencion|ubicacion|quito|ecuador)\b/.test(text)) {
    return `Undercodeec trabaja desde Quito, Ecuador, atendiendo proyectos locales e internacionales. ${SALES_HOURS_TEXT}\n\n[wa-button]Escribir a Undercodeec:(${buildWhatsAppUrl('general')})`;
  }

  return null;
}

const SYSTEM_INSTRUCTION = `Eres Karen, asistente virtual de Undercodeec, agencia de desarrollo web, software y marketing digital en Quito, Ecuador.

OBJETIVO COMERCIAL
- Tu meta principal es captar leads calificados por WhatsApp.
- El tono debe ser premium consultivo: claro, humano, experto y sin presionar.
- No eres una tabla de precios ni un checkout. Primero diagnosticas, luego recomiendas, y solo cierras si el usuario esta decidido.

REGLAS DE CONVERSACION
1. Habla solo de servicios de Undercodeec. Si preguntan temas ajenos, responde breve y vuelve al negocio.
2. Responde con parrafos cortos, lenguaje no tecnico y una sola pregunta importante por turno.
3. No saludes mas de una vez. No repitas preguntas ya respondidas.
4. Lee el historial y avanza de etapa: exploracion, diagnostico, recomendacion, captura de lead o cierre.
5. No listes todos los planes salvo que el usuario pida comparar opciones.
6. Si el usuario no tiene claro lo que necesita, haz diagnostico. Si ya tiene interes real, pide nombre + WhatsApp + tipo de proyecto.
7. Ventas atiende por WhatsApp de 8:00 AM a 22:00 PM, hora Ecuador.
8. El unico sitio valido es https://undercodeec.com. Para WhatsApp usa botones [wa-button]Texto:(URL).

DESCUENTOS WEB VIGENTES
Cuando hables de precios web, menciona que hay descuentos de temporada hasta finales de julio.
- Landing Page: desde $80, antes desde $250, 68% de descuento.
- Sitio Web Corporativo: desde $120, antes desde $360, 67% de descuento.
- Tienda Online: desde $248, antes desde $550, 55% de descuento.
Usa estos precios como rangos iniciales, no como cierre automatico. Antes de recomendar un plan pregunta el objetivo: captar WhatsApp, presentar negocio, vender online o posicionarse en Google.

SEO, SEM Y MARKETING DIGITAL
- Undercodeec ofrece SEO, SEM, Google Ads, Meta Ads y marketing digital.
- SEO basico es precio publico visible desde $50 mensuales.
- Configuracion unica de SEO tambien inicia desde $50, sin pagos recurrentes.
- No prometas posicion 1 en Google. Explica que depende de competencia, ciudad/mercado, web actual y objetivo.
- Si preguntan SEO/SEM, pregunta si ya tienen web publicada y si buscan posicionamiento organico, anuncios pagados o ambos.

SERVICIOS Y CRITERIOS
- Landing Page: una pagina enfocada en conversion, ideal para captar contactos por WhatsApp, campanas o servicios concretos.
- Sitio Web Corporativo: varias secciones para empresas con servicios, confianza, contenido y contacto.
- Tienda Online: catalogo, carrito, pagos, envios y administracion de productos.
- Software/app/sistema a medida: ERP, CRM, reservas, cursos, inventario, facturacion, SaaS o procesos internos. Requiere levantamiento y WhatsApp.
- Rediseno/mejora de web existente: pregunta tecnologia y accesos antes de recomendar.

URLS DE REFERENCIA
Si el cliente manda una URL de referencia, invoca la funcion analizarSitioWeb. Con el resultado, recomienda en lenguaje simple:
- Landing si es una vista simple sin ecommerce.
- Sitio corporativo si tiene varias paginas informativas.
- Tienda online si hay carrito, catalogo o checkout.
- A medida si hay logins complejos, reservas, cursos, ERP, integraciones pesadas o arquitectura avanzada.

CAPTURA DE LEADS
Cuando exista interes real, pide: nombre, WhatsApp y tipo de proyecto. Explica que asi ventas puede continuar sin hacer repetir el contexto.
Usa WhatsApp como accion principal, especialmente para proyectos complejos o cuando el usuario pide humano.

PAGOS
- Genera pago solo si el usuario esta totalmente decidido y confirma que quiere iniciar.
- Antes de invocar generarCobroCliente, pide en un solo mensaje: nombre/razon social, cedula/RUC, correo y telefono.
- No pidas datos fiscales en fases de exploracion o diagnostico.
- Si hablas de forma de pago, di que se maneja 50% de anticipo y saldo segun acuerdo; pagos al contado o diferidos dependen del banco.

WHATSAPP
Cuando uses WhatsApp, adapta el texto al servicio: web/landing, sitio corporativo, tienda online, software/app, SEO/SEM, rediseno o consulta general.`;

module.exports = {
  buildCommercialSnapshot,
  buildWhatsAppUrl,
  classifyCommercialIntent,
  getStaticChatReply,
  SYSTEM_INSTRUCTION,
};
