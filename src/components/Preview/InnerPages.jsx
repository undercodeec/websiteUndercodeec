import React, { useState, useEffect, useRef } from 'react';
import { FaCreditCard, FaExchangeAlt, FaUpload, FaCheck, FaArrowLeft, FaArrowRight, FaStore, FaChartLine, FaRocket, FaUniversity } from 'react-icons/fa';
import ReactGA from 'react-ga4';
import { AnimatePresence, motion } from 'framer-motion';
import wizardConfig from '@/data/Preview/wizard-config.json';
// import { supabase } from '@/lib/supabaseClient'; // Supabase is paused, moving to local backend

// SVG Icons for project types
const icons = {
  // Sitio Web - Navegador/Monitor
  sitioWeb: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  // Desarrollo de Software - Código
  software: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
      <line x1="14" y1="4" x2="10" y2="20"/>
    </svg>
  ),
  // Tienda Online - Carrito de compras
  ecommerce: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  // Landing Page - Página con cohete
  landingPage: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <path d="M12 11l-2 2 2 2 2-2-2-2z"/>
      <line x1="12" y1="15" x2="12" y2="18"/>
    </svg>
  ),
  // Aplicación Web - Grid/Dashboard
  webApp: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  // Aplicación Móvil - Smartphone
  mobileApp: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
      <line x1="12" y1="18" x2="12" y2="18"/>
      <circle cx="12" cy="18" r="1"/>
    </svg>
  ),
  // Plataforma Moodle - Sombrero de graduación/educación
  moodle: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 10l-10-5L2 10l10 5 10-5z"/>
      <path d="M6 12v5c0 2 3 4 6 4s6-2 6-4v-5"/>
      <line x1="22" y1="10" x2="22" y2="16"/>
    </svg>
  )
};

// Steps for Sitio Web wizard
const sitioWebSteps = [
  { number: 1, title: 'Tipo de proyecto', subtitle: '¿Qué tipo de proyecto deseas?' },
  { number: 2, title: 'Elige tu plan', subtitle: 'Selecciona el paquete ideal' },
  { number: 3, title: 'Identidad', subtitle: 'Datos Esenciales' },
  { number: 4, title: 'Facturación', subtitle: 'Datos Finales' }
];

// Generic steps for other project types
const genericSteps = [
  { number: 1, title: 'Tipo de proyecto', subtitle: '¿Qué tipo de proyecto deseas?' },
  { number: 2, title: 'Información del negocio', subtitle: 'Cuéntanos sobre tu negocio' },
  { number: 3, title: 'Datos de contacto', subtitle: '¿Cómo te contactamos?' }
];

// Steps for Software Development
const softwareSteps = [
  { number: 1, title: 'Tipo de proyecto', subtitle: '¿Qué tipo de proyecto deseas?' },
  { number: 2, title: 'El Problema', subtitle: 'Alcance Funcional' },
  { number: 3, title: 'Complejidad', subtitle: 'Nivel técnico' },
  { number: 4, title: 'Presupuesto', subtitle: 'Cierre y Tiempos' }
];

// Steps for E-commerce
// Steps for E-commerce
const ecommerceSteps = [
  { number: 1, title: 'Tipo de proyecto', subtitle: '¿Qué tipo de proyecto deseas?' },
  { number: 2, title: 'Elige tu plan', subtitle: 'Selecciona el paquete ideal' },
  { number: 3, title: 'Identidad', subtitle: 'Datos Esenciales' },
  { number: 4, title: 'Facturación', subtitle: 'Datos Finales' }
];

// Steps for Landing Page
const landingPageSteps = [
  { number: 1, title: 'Tipo de proyecto', subtitle: '¿Qué tipo de proyecto deseas?' },
  { number: 2, title: 'Elige tu plan', subtitle: 'Selecciona el paquete ideal' },
  { number: 3, title: 'Identidad', subtitle: 'Datos Esenciales' },
  { number: 4, title: 'Facturación', subtitle: 'Datos Finales' }
];

// Steps for Web App (Custom Flow)
const appWebSteps = [
  { number: 1, title: 'Tipo de proyecto', subtitle: '¿Qué tipo de proyecto deseas?' },
  { number: 2, title: 'Identidad', subtitle: 'Datos Esenciales' },
  { number: 3, title: 'Solución', subtitle: 'Enfoque y Tecnología' },
  { number: 4, title: 'Usuarios', subtitle: 'Volumen y Seguridad' },
  { number: 5, title: 'Diagnóstico', subtitle: 'Análisis Final' }
];

// Steps for Mobile App (New Flow)
const appMobileSteps = [
  { number: 1, title: 'Tipo de proyecto', subtitle: '¿Qué tipo de proyecto deseas?' },
  { number: 2, title: 'Identidad', subtitle: 'Estándar' },
  { number: 3, title: 'Plataforma y Tecnología', subtitle: 'El Costo Base' },
  { number: 4, title: 'Funcionalidades Críticas', subtitle: 'El Costo Extra' },
  { number: 5, title: 'Diagnóstico', subtitle: 'Revisión Final' }
];

// Steps for Moodle Platform (New Flow)
const moodleSteps = [
  { number: 1, title: 'Tipo de proyecto', subtitle: '¿Qué tipo de proyecto deseas?' },
  { number: 2, title: 'Identidad', subtitle: 'Datos Esenciales' },
  { number: 3, title: 'Escala y Usuarios', subtitle: 'Infraestructura' },
  { number: 4, title: 'Contenido y Diseño', subtitle: 'Configuración' },
  { number: 5, title: 'Propuesta', subtitle: 'Revisión Final' }
];

// Config for Landing Page - Price Cards
const landingPriceCards = [
  {
    id: 'lanzamiento',
    price: 80,
    originalPrice: 250,
    discount: 68,
    label: '🎯 Landing Express',
    description: 'Lanza tu campaña en tiempo récord. Una sola página diseñada exclusivamente para que el cliente realice una acción: llamar o escribir por WhatsApp.',
    icon: 'circle',
    features: [
      { title: "Landing page de una sola sección", description: "Página enfocada en captación o ventas, diseñada para que el visitante tome acción de inmediato." },
      { title: "Diseño responsive para celulares", description: "Optimizado para que se vea y funcione perfecto en cualquier dispositivo móvil." },
      { title: "Botón flotante de WhatsApp y llamada directa", description: "Accesos rápidos visibles en todo momento para que el cliente te contacte sin buscar." },
      { title: "Formulario de contacto o captura de prospectos", description: "Recopila los datos de quienes están interesados en tu servicio o producto." },
      { title: "Sección de beneficios del servicio o producto", description: "Presenta de forma clara qué gana el cliente contigo, antes de que se vaya." },
      { title: "Dominio .com y hosting básico por 1 año", description: "Tu dirección web y alojamiento incluidos sin costo extra durante el primer año." },
      { title: "5 correos corporativos", description: "Cuentas tipo info@tunegocio.com para proyectar profesionalismo desde el primer contacto." },
      { title: "SEO técnico base", description: "Título, metadescripción, H1, indexación y estructura inicial para que Google te encuentre." },
      { title: "1 mes de soporte posterior a la entrega", description: "Acompañamiento para ajustes y dudas durante el primer mes tras el lanzamiento." }
    ]
  },
  {
    id: 'crecimiento',
    price: 192,
    originalPrice: 600,
    discount: 68,
    label: '🔥 Landing Estratégica',
    description: 'Convertimos tus clics en dinero. Diseño persuasivo con herramientas de rastreo para medir cada dólar invertido en publicidad.',
    icon: 'triangle',
    features: [
      { title: "Todo lo de la Landing Express", description: null },
      { title: "Textos persuasivos para tu oferta", description: "Presentamos mejor tu propuesta de valor y motivamos al cliente a contactarte con lenguaje orientado a la acción." },
      { title: "Formulario optimizado para captar prospectos", description: "Menos campos, mejor orden y diseño enfocado en reducir la fricción al momento de registrarse." },
      { title: "Recurso promocional o incentivo de conversión", description: "Descuento, guía o beneficio especial para aumentar el número de personas que dejan sus datos." },
      { title: "Seguimiento de campañas y anuncios con Google Analitycs", description: "Medimos de dónde llegan tus contactos para que sepas qué canal te está dando resultados reales ." },
      { title: "Integración con WhatsApp y respuestas iniciales", description: "Conectamos el formulario con WhatsApp y configuramos respuestas automáticas para atender prospectos más rápido." }
    ]
  },
  {
    id: 'autoridad',
    price: 480,
    originalPrice: 1500,
    discount: 68,
    label: '⚡ Landing Premium',
    description: 'El ecosistema de ventas definitivo. Un embudo automatizado que trabaja y califica prospectos por ti las 24 horas.',
    icon: 'star',
    features: [
      { title: "Todo lo de la Landing Express", description: null },
      { title: "Palabras clave optimizadas para Google", description: "Seleccionadas según lo que buscan tus clientes reales, para aparecer justo cuando alguien necesita lo que ofreces." },
      { title: "Campaña en Google Ads activa durante 1 mes", description: "Configuración avanzada de segmentación, anuncios y presupuesto para atraer tráfico calificado desde el primer día." },
      { title: "Diseño personalizado con animaciones inmersivas", description: "Experiencia visual de alto impacto que capta la atención, transmite profesionalismo y hace que tu marca sea imposible de olvidar." }
    ]
  }
];

// Config for Website (Sitio Web) - Price Cards
const sitioWebPriceCards = [
  {
    id: 'lanzamiento',
    price: 120,
    originalPrice: 360,
    discount: 67,
    label: '🚀 Plan Lanzamiento',
    description: 'Tu negocio abierto al mundo 24/7. Una web profesional, rápida y lista para generar confianza desde el primer clic.',
    icon: 'circle',
    features: [
      { title: "Diseño profesional con hasta 5 páginas", description: "Inicio, Servicios, Nosotros, Contacto y 1 página adicional según tu negocio." },
      { title: "Adaptado para celulares, tablets y computadoras", description: "Tu web se ve y funciona perfecto en cualquier dispositivo, sin excepciones." },
      { title: "Dominio .com y hosting incluido por 1 año", description: "Tu dirección web y alojamiento listos desde el primer día, sin costos ocultos." },
      { title: "Certificado de seguridad SSL", description: "Candado verde en el navegador para transmitir confianza y proteger los datos de tus visitantes." },
      { title: "Hasta 5 cuentas de correo corporativo", description: "Cuentas tipo contacto@tunegocio.com para comunicarte con imagen profesional." },
      { title: "Formulario de contacto y botón de WhatsApp", description: "Canales de comunicación directa para que los clientes te encuentren con un solo clic." },
      { title: "Configuración inicial en Google", description: "Tu web registrada en buscadores para que empiece a aparecer cuando busquen tu negocio." },
      { title: "1 mes de soporte técnico incluido", description: "Ajustes, dudas y cambios menores cubiertos durante el primer mes tras el lanzamiento." }
    ]
  },
  {
    id: 'crecimiento',
    price: 264,
    originalPrice: 800,
    discount: 67,
    label: '📈 Plan Crecimiento',
    description: 'Transformamos visitas en clientes reales. Estrategia web diseñada específicamente para captar prospectos y vender más.',
    icon: 'triangle',
    features: [
      { title: "Todo lo del Plan Lanzamiento", description: null },
      { title: "Hasta 8 páginas con estructura para vender más", description: "Arquitectura de contenido pensada para guiar al visitante hacia el contacto o la compra." },
      { title: "Textos persuasivos que generan confianza", description: "Comunicamos mejor tu oferta con lenguaje orientado a convencer y reducir la duda del cliente." },
      { title: "Optimización de velocidad de carga", description: "Tu web carga rápido en cualquier dispositivo para que no pierdas visitas por tiempos de espera." },
      { title: "Posicionamiento local en Google", description: "Palabras clave, Google Maps y búsquedas de tu ciudad o zona para aparecer donde están tus clientes." },
      { title: "Google Analytics y Search Console conectados", description: "Ve cuántas personas visitan tu web, desde dónde llegan y qué páginas les interesan más." },
      { title: "Integración con tus herramientas", description: "CRM, formularios, email o redes sociales conectados para que todo tu negocio trabaje junto." },
      { title: "3 meses de soporte técnico incluido", description: "Ajustes, actualizaciones y asistencia técnica cubiertos durante los primeros tres meses." }
    ]
  },
  {
    id: 'autoridad',
    price: 660,
    originalPrice: 2000,
    discount: 67,
    label: '🏆 Plan Autoridad',
    description: 'El ecosistema digital definitivo. Plataformas exclusivas hechas a medida con automatización total para empresas líderes.',
    icon: 'star',
    features: [
      { title: "Todo lo del Plan Crecimiento", description: null },
      { title: "Diseño 100% personalizado, sin plantillas", description: "Interfaz única diseñada desde cero, sin elementos genéricos, para que tu marca destaque frente a la competencia." },
      { title: "Automatización con Inteligencia Artificial", description: "Respuestas automáticas, captación de prospectos y atención fuera de horario para que no pierdas ninguna oportunidad." },
      { title: "Sistemas avanzados a medida", description: "Catálogos, reservas, cotizadores, portales de clientes o cualquier función específica que tu negocio necesite." },
      { title: "Seguridad reforzada", description: "Protección contra ataques, respaldos automáticos y monitoreo constante para que tu web esté siempre disponible y segura." },
      { title: "Campaña en Google Ads activa durante 1 mes", description: "Palabras clave seleccionadas para tu negocio, anuncios optimizados y segmentación avanzada por ubicación, horario y tipo de cliente." },
      { title: "Seguimiento de resultados de la campaña", description: "Reporte de cuántos clics, consultas y contactos generó tu inversión en Google para que midas el retorno real." },
      { title: "Soporte VIP prioritario por 6 meses", description: "Atención preferencial con tiempos de respuesta reducidos para cambios, actualizaciones y asistencia técnica." }
    ]
  }
];

// Config for Ecommerce (Tienda Online) - Price Cards
const ecommercePriceCards = [
  {
    id: 'lanzamiento',
    price: 248,
    originalPrice: 550,
    discount: 55,
    label: '🛒 Tienda de Lanzamiento',
    description: 'Lanza tu primera tienda online. Todo lo necesario para vender de forma segura, rápida y sin complicaciones técnicas.',
    icon: 'circle',
    features: [
      { title: "Catálogo de productos administrable", description: "Agrega, edita y organiza tus productos sin necesitar conocimientos técnicos." },
      { title: "Carga inicial de hasta 20 productos", description: "Tu equipo los sube y configura por ti para que empieces a vender de inmediato." },
      { title: "Carrito de compras y proceso de pago seguro", description: "Tus clientes pagan con tarjeta, transferencia o billeteras digitales sin salir de tu tienda." },
      { title: "Dominio .com, hosting y SSL por 1 año", description: "Tu dirección web, alojamiento y certificado de seguridad incluidos sin costos ocultos." },
      { title: "Diseño adaptado para todos los dispositivos", description: "Tu tienda se ve y funciona perfecto en celulares, tablets y computadoras." },
      { title: "Configuración de envíos", description: "Zonas, peso o monto del pedido configurados para calcular el costo de entrega automáticamente." },
      { title: "Configuración inicial en Google", description: "Tu tienda registrada en buscadores para que empiece a aparecer cuando busquen tus productos." },
      { title: "5 correos corporativos", description: "Cuentas tipo ventas@tunegocio.com para gestionar tu tienda con imagen profesional." },
      { title: "Capacitación para gestionar tu tienda", description: "Te enseñamos a administrar tu tienda de forma independiente desde el primer día." },
      { title: "1 mes de soporte técnico incluido", description: "Ajustes y asistencia cubiertos durante el primer mes tras el lanzamiento." }
    ]
  },
  {
    id: 'crecimiento',
    price: 383,
    originalPrice: 850,
    discount: 55,
    label: '🚀 Tienda de Crecimiento',
    description: 'Escala tus ventas y automatiza procesos. Mejoramos la experiencia de compra y recuperamos clientes indecisos.',
    icon: 'triangle',
    features: [
      { title: "Todo lo de la Tienda de Lanzamiento", description: null },
      { title: "Filtros de búsqueda avanzados", description: "Tus clientes encuentran lo que buscan por categoría, precio, color o talla en segundos." },
      { title: "SEO técnico avanzado", description: "Posiciónate mejor en Google y atrae más visitas sin pagar publicidad gracias a una estructura optimizada." },
      { title: "Recuperación de carritos abandonados", description: "Recordatorios automáticos para clientes que agregaron productos pero no completaron su compra." },
      { title: "Control de inventario en tiempo real", description: "Stock actualizado automáticamente con cada venta para evitar errores y sobreventa." },
      { title: "Estrategia de envíos por zonas y condiciones", description: "Envío gratis por monto mínimo, tarifas diferenciadas o retiro en tienda según tu operativa." },
      { title: "3 meses de soporte técnico incluido", description: "Ajustes, actualizaciones y asistencia cubiertos durante los primeros tres meses." }
    ]
  },
  {
    id: 'elite',
    price: 1571,
    originalPrice: 3490,
    discount: 55,
    label: '💎 Tienda Élite',
    description: 'Infraestructura tecnológica de alto rendimiento para líderes del mercado. Velocidad extrema e integraciones corporativas.',
    icon: 'star',
    features: [
      { title: "Todo lo de la Tienda de Crecimiento", description: null },
      { title: "Tecnología ultra rápida", description: "Servidores de alto rendimiento para que tu tienda cargue en segundos y no pierda ventas por lentitud." },
      { title: "Conexión con tus sistemas empresariales", description: "Integración con tu ERP, CRM, sistema contable o plataformas de gestión interna vía API." },
      { title: "Recomendador inteligente con IA", description: "Sugiere productos relacionados a cada cliente según su historial y comportamiento de compra para aumentar el ticket promedio." },
      { title: "Ventas internacionales", description: "Múltiples monedas, idiomas y métodos de pago para vender fuera del país sin barreras técnicas." },
      { title: "Automatización de marketing", description: "Correos, notificaciones y promociones que se envían solos según el comportamiento de tus clientes." },
      { title: "Facturación electrónica integrada", description: "Generación automática de comprobantes de venta cumpliendo la normativa del SRI." },
      { title: "Seguridad reforzada y respaldos automáticos", description: "Protección contra ataques, monitoreo constante y copias de seguridad diarias para que tu tienda esté siempre disponible." },
      { title: "Soporte VIP prioritario por 6 meses", description: "Atención preferencial con tiempos de respuesta reducidos para cualquier ajuste o incidencia." }
    ]
  }
];

// Config for Landing Page (legacy for other steps)
const configLandingPage = {
    budgetRanges: landingPriceCards,
    mensajeCierre: "Gracias por completar los pasos. Un asesor revisará tu estrategia."
};

const stepVariants = {
  enter: (dir) => ({
    x: dir === 'forward' ? 50 : -50,
    opacity: 0,
    filter: 'blur(6px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
  },
  exit: (dir) => ({
    x: dir === 'forward' ? -50 : 50,
    opacity: 0,
    filter: 'blur(6px)',
  }),
};

const AffiliationSection = () => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [direction, setDirection] = useState('forward');
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showError, setShowError] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Landing Page pricing states
  const [showLandingPrices, setShowLandingPrices] = useState(false);
  const [selectedLandingPlan, setSelectedLandingPlan] = useState('');
  
  // Sitio Web pricing states
  const [showSitioWebPrices, setShowSitioWebPrices] = useState(false);
  const [selectedSitioWebPlan, setSelectedSitioWebPlan] = useState('');

  // Tienda Online pricing states
  const [showEcommercePrices, setShowEcommercePrices] = useState(false);
  const [selectedEcommercePlan, setSelectedEcommercePlan] = useState('');
  const [openFeatures, setOpenFeatures] = useState({});

  const toggleFeature = (key) => setOpenFeatures(prev => ({ ...prev, [key]: !prev[key] }));

  // Google Drive integration states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Payment window states (for monitoring PayPhone popup)
  const [paymentWindowOpen, setPaymentWindowOpen] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false); // New state for terms
  const paymentWindowRef = useRef(null);
  const checkPaymentIntervalRef = useRef(null);
  
  // Google Apps Script URL (Security: usar variable de entorno para no exponer la URL)
  const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwJJ91bFrS7VwdksBOfZluJZ6pLmwhdVw4TTOBsSWPtX2B91YqEa8OUXUPEHBFnCLmrvg/exec';

  // Security: Orígenes permitidos para postMessage de pagos
  const ALLOWED_PAYMENT_ORIGINS = [
    'https://pay.payphonetodoesposible.com',
    'https://api.undercodeec.com',
    ...(typeof window !== 'undefined' ? [window.location.origin] : [])
  ];

  const executeRecaptcha = async (action) => {
    if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.enterprise) {
      try {
        const token = await window.grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, {action});
        return token;
      } catch (err) {
        console.error("Recaptcha error:", err);
      }
    }
    return null;
  };
  
  const formatPrice = (price) => {
    return Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  // Wizard form data state
  const [wizardData, setWizardData] = useState({
    // Step 1 - Project Type
    projectType: '',
    
    // Step 2 - Business Details (Sitio Web)
    businessName: '',
    sector: '',
    sectorOtro: '',
    domainStatus: '',
    domainName: '',
    
    // Step 3 - Budget (Sitio Web)
    budget: 360,
    isCustomQuote: false,
    customBudget: '',
    paymentMethod: '',
    
    // Step 4 - Billing (Sitio Web)
    rucCedula: '',
    razonSocial: '',
    tipoCliente: '', // 'consumidor_final' o 'empresa'
    email: '',
    telefono: '',
    // Dirección de Facturación
    callePrincipal: '',
    calleSecundaria: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    pais: '',
    // Método de pago
    metodoPago: '', // 'tarjeta' o 'transferencia'
    tipoPago: 'total', // 'anticipo' (50%) o 'total' (100%)
    deferredMonths: 0, // 0, 3, 6, 12
    comprobante: null,
    
    // Card payment fields (for PayPhone integration)
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    
    // === Desarrollo de Software fields ===
    // Paso 1 - El Problema
    softwareObjetivo: '',
    softwareProblema: '',
    softwareEstado: '',
    
    // Paso 2 - Complejidad Técnica
    softwareEscala: '',
    softwareRoles: [],
    softwareIntegraciones: [],
    
    // Paso 3 - Presupuesto y Tiempos
    softwarePresupuesto: '',
    softwareTiempo: '',
    
    // Contact info for software
    softwareTiempo: '',
    softwareNombre: '',
    softwareEmail: '',

    // === Aplicación Web fields (Nuevo) ===
    appWebObjetivo: '', // interno, saas, clientes, otros
    appWebObjetivoDetalle: '', // detalle para 'otros'
    appWebMobile: '', // responsive, pwa, desktop
    appWebDescripcion: '',
    appWebUsuarios: '', // pequeno, mediano, masivo
    appWebRoles: [], // admin, editores, lectores, auditores, otros
    appWebRolesDetalle: '', // detalle para 'otros'
    appWebReportes: '', // dashboards, export, none
    appWebDiagnostico: false, // para estado de carga en paso final
    softwareTelefono: '',
    
    // === App Móvil fields (Nuevo) ===
    appMobilePlataforma: '', // Android, iOS, Ambos
    appMobileTipo: '', // Gestion, Clientes, Informativa
    appMobileFuncionalidades: [], // GPS, Camara, Push, Offline, None
    appMobilePublicacion: '', // Ayuda, Tengo cuentas

    // === Plataforma Moodle fields (Nuevo) ===
    moodleUso: '', // colegio, capacitacion, venta
    moodleUsuarios: '', // bajo, medio, alto
    moodleClases: '', // asincronicas, en_vivo
    moodleDiseno: '', // estandar, a_medida
    // Reuse contact fields for Moodle logic (softwareNombre, softwareEmail, etc.)
    // === Tienda Online fields ===
    // Paso 1 - Identidad
    ecommerceNombre: '',
    ecommerceSector: '',
    ecommerceDominio: '', // tengo, no_tengo, migrar
    ecommerceDominioUrl: '', // Si selecciona tengo/migrar
    
    // Paso 2 - Catálogo
    ecommerceCantidadProductos: '',
    ecommerceTipoProductos: '',
    
    // Paso 3 - Logística y Pagos
    ecommerceEnvios: '',
    ecommerceMetodosPago: [], // Array multiselección
    
    // Contacto (reutilizamos o agregamos específicos si es necesario)
    // Usaremos los mismos campos de contacto básico para la asesoría
    
    // === Landing Page fields ===
    // Paso 2 (Identidad) reutiliza businessName, sector, domainStatus (mapeamos UI a variables existentes o nuevas si divergen mucho)
    // Para Landing Page "Nombre de tu Campaña/Producto" usaremos businessName.
    // Sector usaremos sector.
    
    // Paso 3 (Estrategia)
    landingObjetivo: '', 
    landingContenido: '',
    landingReferencia: '',
    
    // Paso 4 (Integraciones)
    landingDestinoDatos: '',
    landingTracking: [], // Checkboxes
  });

  // Efecto para actualizar precio Tienda Online según catálogo
  useEffect(() => {
    if (selectedPlan === 'Tienda Online') {
        const prodCount = wizardData.ecommerceCantidadProductos;
        let newBudget = 150; // Default emprendedor

        if (prodCount === 'emprendedor') newBudget = 150;
        else if (prodCount === 'pyme') newBudget = 200;
        else if (prodCount === 'empresa') newBudget = 250;
        else if (prodCount === 'masivo') newBudget = 580;

        // Solo actualizamos si no es cotización personalizada
        if (!wizardData.isCustomQuote) {
            setWizardData(prev => ({ ...prev, budget: newBudget }));
        }
    }
  }, [wizardData.ecommerceCantidadProductos, selectedPlan, wizardData.isCustomQuote]);

  // Effect to listen for payment completion messages from popup
  useEffect(() => {
    const handlePaymentMessage = (event) => {
      // Ignore PayPhone's internal postrobot messages
      if (event.data && event.data.__post_robot_10_0_37__) {
        return; // Skip PayPhone internal messages
      }
      
      // SECURITY: Verificar que el mensaje viene de un origen permitido
      if (!ALLOWED_PAYMENT_ORIGINS.includes(event.origin)) {
        return; // Ignorar mensajes de orígenes desconocidos
      }
      
      // Check if the message is about payment
      if (event.data && event.data.type) {
        if (event.data.type === 'PAYMENT_COMPLETED' && event.data.success) {
          setPaymentWindowOpen(false);

          // SECURITY: Usar sessionStorage en lugar de localStorage para datos sensibles
          const savedOrderData = sessionStorage.getItem('pendingOrderData');
          const savedTxId = sessionStorage.getItem('pendingClientTxId');
          if (savedOrderData) {
            const orderData = JSON.parse(savedOrderData);
            handlePaymentCompleted(orderData, savedTxId);
          } else {
            setShowConfirmation(true);
          }
        } else if (event.data.type === 'PAYMENT_CANCELLED') {
          setPaymentWindowOpen(false);
          alert('El pago fue cancelado. Puedes intentar de nuevo.');
        } else if (event.data.type === 'PAYMENT_ERROR') {
          setPaymentWindowOpen(false);
          alert('Hubo un error con el pago. Por favor intenta de nuevo o contacta a soporte.');
        }
      }
    };

    // Also listen for storage events as backup (popup writes to localStorage)
    const handleStorageChange = (event) => {
      if (event.key === 'paymentNotification') {
        try {
          const data = JSON.parse(event.newValue);
          if (data && data.type === 'PAYMENT_COMPLETED' && data.success) {
            setPaymentWindowOpen(false);
            localStorage.removeItem('paymentNotification');

            const savedOrderData = sessionStorage.getItem('pendingOrderData');
            const savedTxId = sessionStorage.getItem('pendingClientTxId');
            if (savedOrderData) {
              const orderData = JSON.parse(savedOrderData);
              handlePaymentCompleted(orderData, savedTxId);
            } else {
              setShowConfirmation(true);
            }
          }
        } catch (e) {
          console.error('Error parsing storage notification:', e);
        }
      }
    };

    window.addEventListener('message', handlePaymentMessage);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('message', handlePaymentMessage);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Get configs from JSON
  const configSitioWeb = wizardConfig.sitioWeb;
  const configSoftware = wizardConfig.desarrolloSoftware;
  const configEcommerce = wizardConfig.tiendaOnline;
  
  // Dynamic config selection
  let config = configSitioWeb;
  if (selectedPlan === 'Tienda Online') config = configEcommerce;
  else if (selectedPlan === 'Desarrollo de Software') config = configSoftware;
  else if (selectedPlan === 'Landing Page') config = configLandingPage;

  // Project types mapping con iconos
  const projectTypes = [
    { id: 'Sitio Web', name: 'Sitio Web', icon: icons.sitioWeb },
    { id: 'Desarrollo de Software', name: 'Desarrollo de Software', icon: icons.software },
    { id: 'Tienda Online', name: 'Tienda Online', icon: icons.ecommerce },
    { id: 'Landing Page', name: 'Landing Page', icon: icons.landingPage },
    { id: 'Aplicación Web', name: 'Aplicación Web', icon: icons.webApp },
    { id: 'Aplicación Móvil', name: 'Aplicación Móvil', icon: icons.mobileApp },
    { id: 'Plataforma de cursos Moodle', name: 'Plataforma Moodle', icon: icons.moodle }
  ];

  // Get current budget range info
  const getCurrentBudgetInfo = () => {
    const budget = wizardData.budget;
    for (const range of config.budgetRanges) {
      if (budget >= range.min && budget <= range.max) {
        return range;
      }
    }
    return config.budgetRanges[0];
  };

  // Handle wizard data changes
  const handleWizardChange = (field, value) => {
    setWizardData(prev => {
      const updated = { ...prev, [field]: value };
      // Si cambia a anticipo, resetear meses diferidos
      if (field === 'tipoPago' && value === 'anticipo') {
        updated.deferredMonths = 0;
      }
      return updated;
    });
  };

  // Handle multi-select (checkboxes) for software wizard
  const handleMultiSelect = (field, value) => {
    setWizardData(prev => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  // Handle project selection
  const handleProjectSelect = (projectId) => {
    setDirection('forward');
    setSelectedPlan(projectId);
    handleWizardChange('projectType', projectId);

    // For Landing Page: redirect to step 2 (price cards) automatically
    if (projectId === 'Landing Page') {
      setSelectedLandingPlan(''); // Reset selected plan
      setShowSitioWebPrices(false); // Hide Sitio Web prices
      setCurrentStep(2); // Go to step 2 (price cards)
      setTimeout(() => {
        setShowLandingPrices(true);
      }, 100);
    } 
    // For Sitio Web: redirect to step 2 (price cards) automatically
    else if (projectId === 'Sitio Web') {
      setSelectedSitioWebPlan(''); // Reset selected plan
      setShowLandingPrices(false); // Hide Landing prices
      setShowEcommercePrices(false);
      setCurrentStep(2); // Go to step 2 (price cards)
      setTimeout(() => {
        setShowSitioWebPrices(true);
      }, 100);
    }
    // For Tienda Online: redirect to step 2 (price cards) automatically
    else if (projectId === 'Tienda Online') {
        setSelectedEcommercePlan('');
        setShowLandingPrices(false);
        setShowSitioWebPrices(false);
        setCurrentStep(2);
        setTimeout(() => {
            setShowEcommercePrices(true);
        }, 100);
    }
    else {
      setShowLandingPrices(false);
      setShowSitioWebPrices(false);
      setShowEcommercePrices(false);
      setCurrentStep(2);
    }

    ReactGA.event({
      category: 'Planes',
      action: 'click_tipo_proyecto',
      label: projectId,
    });

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', 'SeleccionarTipoProyecto', {
        tipo: projectId,
      });
    }
  };

  // Handle landing plan selection
  const handleLandingPlanSelect = (planId) => {
    setSelectedLandingPlan(planId);
    const selectedCard = landingPriceCards.find(card => card.id === planId);
    if (selectedCard) {
      handleWizardChange('budget', selectedCard.price);
    }
  };

  // Proceed after selecting landing plan
  const handleLandingPlanContinue = () => {
    if (selectedLandingPlan) {
      setCurrentStep(3); // Go to step 3 (Identity)
    }
  };

  // Handle Sitio Web plan selection
  const handleSitioWebPlanSelect = (planId) => {
    setSelectedSitioWebPlan(planId);
    const selectedCard = sitioWebPriceCards.find(card => card.id === planId);
    if (selectedCard) {
      handleWizardChange('budget', selectedCard.price);
    }
  };

  // Submit Sitio Web order to Google Drive
  const submitSitioWebToGoogleDrive = async () => {
    setIsSubmitting(true);
    
    const selectedCard = sitioWebPriceCards.find(card => card.id === selectedSitioWebPlan);
    
    const payload = {
      businessName: wizardData.businessName,
      email: wizardData.email,
      phone: wizardData.telefono,
      ruc: wizardData.rucCedula,
      plan: selectedCard?.label || 'Sitio Web',
      price: selectedCard?.price || wizardData.budget
    };
    
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      setShowConfirmation(true);
      
      ReactGA.event({
        category: 'Sitio Web',
        action: 'order_submitted',
        label: selectedCard?.label,
        value: selectedCard?.price
      });
      
    } catch (error) {
      console.error('Error submitting to Google Drive:', error);
      setShowConfirmation(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Landing Page order to Google Drive
  const submitToGoogleDrive = async () => {
    setIsSubmitting(true);
    
    // Get selected plan data
    const selectedCard = landingPriceCards.find(card => card.id === selectedLandingPlan);
    
    const payload = {
      businessName: wizardData.businessName,
      email: wizardData.email,
      phone: wizardData.telefono,
      ruc: wizardData.rucCedula,
      plan: selectedCard?.label || 'Landing Page',
      price: selectedCard?.price || wizardData.budget
    };
    
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script requires no-cors
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      // With no-cors, we can't read the response, so we assume success
      // The user will receive an email with the folder link
      setShowConfirmation(true);
      
      // Track event
      ReactGA.event({
        category: 'Landing Page',
        action: 'order_submitted',
        label: selectedCard?.label,
        value: selectedCard?.price
      });
      
    } catch (error) {
      console.error('Error submitting to Google Drive:', error);
      // Still show confirmation - the script might have worked
      setShowConfirmation(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle PayPhone payment - calls backend API to create payment link
  const handlePayPhonePayment = async () => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq('track', 'InitiateCheckout');
    }
    
    setIsSubmitting(true);
    
    let selectedCard;
    let baseAmount;
    let planName;

    if (selectedPlan === 'Sitio Web') {
       selectedCard = sitioWebPriceCards.find(card => card.id === selectedSitioWebPlan);
       baseAmount = selectedCard?.price || 120;
       planName = selectedCard?.label || 'Sitio Web';
    } else if (selectedPlan === 'Tienda Online') {
       selectedCard = ecommercePriceCards.find(card => card.id === selectedEcommercePlan);
       baseAmount = selectedCard?.price || 850;
       planName = selectedCard?.label || 'Tienda Online';
    } else {
       // Default to Landing Page logic
       selectedCard = landingPriceCards.find(card => card.id === selectedLandingPlan);
       baseAmount = selectedCard?.price || 80;
       planName = selectedCard?.label || 'Landing Page';
    }

    // Calculate amount based on payment type (50% for anticipo, 100% for total)
    let basePayment = wizardData.tipoPago === 'anticipo' ? Math.round(baseAmount / 2) : baseAmount;
    
    // Al pagar con tarjeta de crédito, se añade un 5% de recargo sobre el total
    // NOTA: El interés de diferido NO se suma aquí. PayPhone y el Banco se encargan.
    const amount = Math.round(basePayment * 1.05);
    
    // Backend API URL - adjust for production
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
    
    // Prepare order data for email sending
    const orderData = {
      tipoCliente: wizardData.tipoCliente,
      rucCedula: wizardData.rucCedula,
      razonSocial: wizardData.razonSocial,
      email: wizardData.email,
      telefono: wizardData.telefono,
      callePrincipal: wizardData.callePrincipal,
      calleSecundaria: wizardData.calleSecundaria,
      ciudad: wizardData.ciudad,
      provincia: wizardData.provincia,
      codigoPostal: wizardData.codigoPostal,
      pais: wizardData.pais,
      metodoPago: 'tarjeta',
      tipoPago: wizardData.tipoPago,
      planName: planName,
      planPrice: baseAmount,
      amountPaid: amount,
      businessName: wizardData.businessName,
      // New fields for Landing Page
      sector: wizardData.sector,
      sectorOtro: wizardData.sectorOtro,
      domainStatus: wizardData.domainStatus,
      domainName: wizardData.domainName
    };
    
    try {
      // SECURITY NOTE: El backend DEBE validar el precio basándose en planId y tipoPago,
      // no confiar en el amount enviado desde el frontend.
      const response = await fetch(`${BACKEND_URL}/api/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          planId: selectedPlan === 'Sitio Web' ? selectedSitioWebPlan : (selectedPlan === 'Tienda Online' ? selectedEcommercePlan : selectedLandingPlan),
          tipoPago: wizardData.tipoPago,
          projectType: selectedPlan,
          planName: `${planName} - ${wizardData.tipoPago === 'anticipo' ? 'Anticipo 50%' : 'Pago Total'}`,
          orderData: orderData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el pago');
      }
      
      const data = await response.json();
      
      if (data.paymentUrl) {
        // SECURITY: Usar sessionStorage para datos sensibles (se limpia al cerrar pestaña)
        sessionStorage.setItem('pendingOrderData', JSON.stringify(orderData));
        if (data.clientTransactionId) {
          sessionStorage.setItem('pendingClientTxId', data.clientTransactionId);
        }
        if (data.paymentSessionToken) {
          sessionStorage.setItem('paymentSessionToken', data.paymentSessionToken);
        }
        
        // Track payment initiation
        ReactGA.event({
          category: 'Landing Page',
          action: 'payment_initiated',
          label: planName,
          value: amount
        });
        
        // Open PayPhone in a new popup window
        const width = 600;
        const height = 700;
        const left = (window.innerWidth - width) / 2 + window.screenX;
        const top = (window.innerHeight - height) / 2 + window.screenY;
        
        const paymentWindow = window.open(
          data.paymentUrl,
          'PayPhonePayment',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
        
        paymentWindowRef.current = paymentWindow;
        setPaymentWindowOpen(true);
        setIsSubmitting(false);
        
        // Monitor the popup window and active storage checks
        const clientTransactionId = data.clientTransactionId;

        let pollingTick = 0;

        const handlePaymentMessage = (event) => {
            // SECURITY: Verificar origen del mensaje
            if (!ALLOWED_PAYMENT_ORIGINS.includes(event.origin)) {
                return;
            }
            if (event.data && event.data.type === 'PAYMENT_COMPLETED') {
                if (paymentWindow && !paymentWindow.closed) {
                    paymentWindow.close();
                }
                window.removeEventListener('message', handlePaymentMessage);
                if (checkPaymentIntervalRef.current) {
                    clearInterval(checkPaymentIntervalRef.current);
                    checkPaymentIntervalRef.current = null;
                }
                setPaymentWindowOpen(false);
                
                // Clean up flags
                localStorage.removeItem('paymentNotification');
                localStorage.removeItem('paymentCompleted');

                handlePaymentCompleted(orderData, clientTransactionId);
            }
        };

        window.addEventListener('message', handlePaymentMessage);

        console.log('[PayPhone Poll] iniciado para clientTxId:', clientTransactionId, ' tokenPresente:', !!data.paymentSessionToken);

        const MAX_POLLING_TICKS = 600; // ~10 min @ 1s/tick
        checkPaymentIntervalRef.current = setInterval(async () => {
          pollingTick++;

          // Tope de seguridad: si el polling lleva ~10 min sin confirmacion,
          // lo detenemos para no golpear el backend para siempre.
          if (pollingTick > MAX_POLLING_TICKS) {
            console.warn('[PayPhone Poll] timeout alcanzado — deteniendo polling');
            if (checkPaymentIntervalRef.current) clearInterval(checkPaymentIntervalRef.current);
            checkPaymentIntervalRef.current = null;
            setPaymentWindowOpen(false);
            return;
          }

          // 1. ACTIVE BACKEND POLLING (Every ~2 seconds)
          // Consultamos al backend si PayPhone ya confirmó el pago, sin depender de la ventana
          if (clientTransactionId && pollingTick % 2 === 0) {
            try {
              const sessionToken = data.paymentSessionToken || sessionStorage.getItem('paymentSessionToken');
              const res = await fetch(
                `${BACKEND_URL}/api/check-payment-status/${clientTransactionId}`,
                { headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {} }
              );
              console.log('[PayPhone Poll] tick=', pollingTick, ' status=', res.status);
              if (res.ok) {
                const statusData = await res.json();
                console.log('[PayPhone Poll] data=', statusData);

                if (statusData.success && statusData.status === 'Approved') {
                  console.log('✅ Payment confirmed via Backend Polling!');
                  if (checkPaymentIntervalRef.current) clearInterval(checkPaymentIntervalRef.current);
                  checkPaymentIntervalRef.current = null;
                  setPaymentWindowOpen(false);
                  
                  // Close popup if still open
                  if (!paymentWindow.closed) {
                    paymentWindow.close();
                  }
                  
                  // Clean up flags
                  localStorage.removeItem('paymentNotification');
                  localStorage.removeItem('paymentCompleted');

                  handlePaymentCompleted(orderData, clientTransactionId);
                  return;
                }
              }
            } catch (e) {
              // Mostrar error en consola para debugging
              console.error('⚠️ Polling Error:', e);
            }
          }

          // 2. Check for payment completion in localStorage (Backup)
          // This ensures we catch it even if event listener failed or window is still open
          const paymentNotification = localStorage.getItem('paymentNotification');
          const paymentCompleted = localStorage.getItem('paymentCompleted');
          
          if (paymentNotification || paymentCompleted) {
            if (checkPaymentIntervalRef.current) clearInterval(checkPaymentIntervalRef.current);
            checkPaymentIntervalRef.current = null;
            setPaymentWindowOpen(false);
            
            // Clean up flags
            localStorage.removeItem('paymentNotification');
            localStorage.removeItem('paymentCompleted');
            
            // Close popup if still open
            if (!paymentWindow.closed) {
              paymentWindow.close();
            }

            handlePaymentCompleted(orderData, clientTransactionId);
            return;
          }

          // 3. Check if window was closed manually
          if (paymentWindow.closed) {
            if (checkPaymentIntervalRef.current) clearInterval(checkPaymentIntervalRef.current);
            checkPaymentIntervalRef.current = null;
            setPaymentWindowOpen(false);

            // Si el usuario alcanzo a pagar, localStorage tendra el flag.
            const pendingData = localStorage.getItem('paymentCompleted');
            if (pendingData) {
              localStorage.removeItem('paymentCompleted');
              handlePaymentCompleted(orderData, clientTransactionId);
              return;
            }

            // Ultima oportunidad: consultar al backend por si el webhook ya
            // confirmo el pago justo antes de que el usuario cerrara la ventana.
            try {
              const sessionToken = data.paymentSessionToken || sessionStorage.getItem('paymentSessionToken');
              const finalCheck = await fetch(
                `${BACKEND_URL}/api/check-payment-status/${clientTransactionId}`,
                { headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {} }
              );
              if (finalCheck.ok) {
                const finalData = await finalCheck.json();
                if (finalData.success && finalData.status === 'Approved') {
                  console.log('✅ Pago confirmado en ultima verificacion tras cerrar popup');
                  handlePaymentCompleted(orderData, clientTransactionId);
                  return;
                }
              }
            } catch (e) {
              console.error('Error en verificacion final post-cierre:', e);
            }

            // Pago cancelado: limpiar todo y avisar al usuario. NO se dispara
            // ningun email ni se crea carpeta en Drive — eso solo ocurre cuando
            // el backend confirma el pago via webhook de PayPhone.
            sessionStorage.removeItem('pendingOrderData');
            sessionStorage.removeItem('pendingClientTxId');
            sessionStorage.removeItem('paymentSessionToken');
            localStorage.removeItem('paymentNotification');
            localStorage.removeItem('paymentCompleted');
            alert('El pago fue cancelado. No se envio confirmacion ni se creo carpeta. Puedes intentarlo de nuevo cuando quieras.');
          }
        }, 1000);
        
      } else {
        throw new Error('No se recibió el enlace de pago');
      }
      
    } catch (error) {
      console.error('Error creating PayPhone payment:', error);
      alert('Error al procesar el pago. Por favor intenta de nuevo o selecciona transferencia bancaria.');
      setIsSubmitting(false);
    }
  };
  
  // Handle payment completion after returning from PayPhone.
  // SECURITY: para flujos PayPhone se pasa clientTransactionId — el backend
  // verifica el pago server-side y recupera orderData de pendingOrders.
  // NOTA: el envio de emails y la creacion del folder en Drive los dispara
  // el webhook backend cuando PayPhone confirma Approved. Aqui NO llamamos
  // a submitToGoogleDrive() para evitar duplicar el folder. sendOrderEmails
  // se mantiene como red de seguridad: el backend devuelve alreadyProcessed
  // si el webhook ya cumplio (ver /api/send-order-emails).
  const handlePaymentCompleted = async (orderData, clientTransactionId = null) => {
    setCheckingPayment(true);

    try {
      await sendOrderEmails(orderData, clientTransactionId);

      ReactGA.event({
        category: 'Landing Page',
        action: 'payment_completed',
        label: orderData?.planName || 'Unknown Plan',
        value: orderData?.amountPaid || 0
      });

      setShowConfirmation(true);

    } catch (error) {
      console.error('Error processing payment completion:', error);
      setShowConfirmation(true);
    } finally {
      setCheckingPayment(false);
      sessionStorage.removeItem('pendingOrderData');
      sessionStorage.removeItem('pendingClientTxId');
      sessionStorage.removeItem('paymentSessionToken');
    }
  };
  
  // Function to manually check payment status (called from UI when user returns)
  const checkPaymentStatus = async () => {
    setCheckingPayment(true);
    
    // Clear the polling interval to stop dual execution
    if (checkPaymentIntervalRef.current) {
      clearInterval(checkPaymentIntervalRef.current);
      checkPaymentIntervalRef.current = null;
    }
    
    // Get pending order data
    const savedOrderData = sessionStorage.getItem('pendingOrderData');
    if (!savedOrderData) {
      setCheckingPayment(false);
      alert('No se encontró información del pago pendiente.');
      return;
    }
    
    const orderData = JSON.parse(savedOrderData);
    const savedTxId = sessionStorage.getItem('pendingClientTxId');
    await handlePaymentCompleted(orderData, savedTxId);
  };

  // Function to send order confirmation emails.
  // SECURITY: para pagos PayPhone se envía solo clientTransactionId — el backend
  // recupera la orderData server-side y verifica con PayPhone que el pago está
  // Approved antes de enviar emails. Para transferencia bancaria se envía
  // orderData completa (con voucherUrl del propio servidor).
  const sendOrderEmails = async (orderData, clientTransactionId = null) => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';

    try {
      const recaptchaToken = await executeRecaptcha('ORDER_EMAILS');
      if (!recaptchaToken) {
          alert('Por favor, completa el ReCAPTCHA o recarga la página.');
          return;
      }

      // Para PayPhone, basta con clientTransactionId — el backend resuelve el resto.
      const payload = clientTransactionId
        ? { clientTransactionId, recaptchaToken }
        : { orderData, recaptchaToken };

      const response = await fetch(`${BACKEND_URL}/api/send-order-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('✅ Correos de confirmación enviados');
      } else {
        console.error('Error enviando correos');
      }
    } catch (error) {
      console.error('Error al enviar correos:', error);
    }
  };

  // Handle transfer payment submission (send emails immediately)
  const handleTransferSubmit = async () => {
    setIsSubmitting(true);

    const recaptchaToken = await executeRecaptcha('TRANSFERENCIA');
    if (!recaptchaToken) {
      alert('Por favor, completa el ReCAPTCHA o recarga la página.');
      setIsSubmitting(false);
      return;
    }
    
    let selectedCard;
    let baseAmount;
    let planName;

    if (selectedPlan === 'Sitio Web') {
       selectedCard = sitioWebPriceCards.find(card => card.id === selectedSitioWebPlan);
       baseAmount = selectedCard?.price || 120;
       planName = selectedCard?.label || 'Sitio Web';
    } else if (selectedPlan === 'Tienda Online') {
       selectedCard = ecommercePriceCards.find(card => card.id === selectedEcommercePlan);
       baseAmount = selectedCard?.price || 350;
       planName = selectedCard?.label || 'Tienda Online';
    } else {
       selectedCard = landingPriceCards.find(card => card.id === selectedLandingPlan);
       baseAmount = selectedCard?.price || 80;
       planName = selectedCard?.label || 'Landing Page';
    }

    const amount = wizardData.tipoPago === 'anticipo' ? Math.round(baseAmount / 2) : baseAmount;
    
    let publicVoucherUrl = null;

    try {
      // 1. Upload Voucher to BACKEND if exists
      if (wizardData.comprobante) {
        const file = wizardData.comprobante;
        const formData = new FormData();
        formData.append('voucher', file);

        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
        
        const uploadRes = await fetch(`${BACKEND_URL}/api/upload-voucher`, {
          method: 'POST',
          body: formData
        });

        if (!uploadRes.ok) throw new Error('Error al subir el comprobante al servidor');

        const uploadData = await uploadRes.json();
        publicVoucherUrl = uploadData.voucherUrl;
        console.log('✅ Comprobante subido al servidor:', publicVoucherUrl);
      }
    } catch (uploadErr) {
      console.error('Error uploading voucher:', uploadErr);
      alert('Error al subir el comprobante. Por favor intenta de nuevo.');
      setIsSubmitting(false);
      return;
    }
    
    const orderData = {
      tipoCliente: wizardData.tipoCliente,
      rucCedula: wizardData.rucCedula,
      razonSocial: wizardData.razonSocial,
      email: wizardData.email,
      telefono: wizardData.telefono,
      callePrincipal: wizardData.callePrincipal,
      calleSecundaria: wizardData.calleSecundaria,
      ciudad: wizardData.ciudad,
      provincia: wizardData.provincia,
      codigoPostal: wizardData.codigoPostal,
      pais: wizardData.pais,
      metodoPago: 'transferencia',
      tipoPago: wizardData.tipoPago,
      planName: planName,
      planPrice: baseAmount,
      amountPaid: amount,
      businessName: wizardData.businessName,
      voucherUrl: publicVoucherUrl // Include the URL in the order data
    };
    
    try {
      // Send order emails
      await sendOrderEmails(orderData);
      
      // Also submit to Google Drive
      if (selectedPlan === 'Sitio Web') {
        await submitSitioWebToGoogleDrive();
      } else {
        await submitToGoogleDrive();
      }
      
      // Track event
      ReactGA.event({
        category: 'Landing Page',
        action: 'transfer_order_submitted',
        label: planName,
        value: amount
      });
      
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error processing transfer order:', error);
      setShowConfirmation(true); // Still show confirmation
    } finally {
      setIsSubmitting(false);
    }
  };



  // Navigate to next step
  // Handle next step
  const handleNextStep = () => {
    setDirection('forward');
    let maxSteps = 2; // Default for contact form
    
    if (selectedPlan === 'Sitio Web' || selectedPlan === 'Desarrollo de Software') {
      maxSteps = 4;
    } else if (selectedPlan === 'Tienda Online') {
      maxSteps = 4;
    } else if (selectedPlan === 'Landing Page') {
      maxSteps = 4;
    } else if (selectedPlan === 'Aplicación Web') {
      maxSteps = 5;
    } else if (selectedPlan === 'Aplicación Móvil') {
      maxSteps = 5;
    } else if (selectedPlan === 'Plataforma de cursos Moodle') {
      maxSteps = 5;
    }

    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
      setTimeout(() => {
        const wizardSection = document.getElementById('planes');
        if (wizardSection) {
          wizardSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Navigate to previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);

      // For plans that show pricing on step 2, scroll to the project title
      // after exit animation (320ms) so the heading is in view when step 1 enters
      if (currentStep === 2 && ['Sitio Web', 'Landing Page', 'Tienda Online'].includes(selectedPlan)) {
        setTimeout(() => {
          const title = document.getElementById('wizard-project-title');
          if (title) {
            title.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 340);
      }
    }
  };

  // Validate current step based on project type
  const isStepValid = () => {
    // Software Development validation
    if (selectedPlan === 'Desarrollo de Software') {
      switch (currentStep) {
        case 1:
          return selectedPlan !== '';
        case 2:
          return wizardData.softwareObjetivo && wizardData.softwareProblema && wizardData.softwareEstado;
        case 3:
          return wizardData.softwareEscala && wizardData.softwareRoles.length > 0;
        case 4:
          return wizardData.softwarePresupuesto && wizardData.softwareTiempo && wizardData.softwareNombre && wizardData.softwareEmail;
        default:
          return true;
      }
    }

    // Tienda Online validation
    if (selectedPlan === 'Tienda Online') {
      switch (currentStep) {
        case 1:
          return selectedPlan !== '';
        case 2: // Plan Selection
          return selectedEcommercePlan !== '';
        case 3: // Identidad (Reusing Sitio Web logic)
          return wizardData.businessName && wizardData.sector && wizardData.domainStatus;
        case 4: // Facturación & Pago
           return wizardData.rucCedula && wizardData.razonSocial && wizardData.email && wizardData.telefono;  
        default:
          return true;
      }
    }
    
    

    // Web App Validation
    if (selectedPlan === 'Aplicación Web') {
        switch (currentStep) {
            case 1:
                return selectedPlan !== '';
            case 2: // Identidad
                return wizardData.businessName && wizardData.sector && wizardData.domainStatus;
            case 3: // Solución
                const validObjetivo = wizardData.appWebObjetivo !== 'otros' || (wizardData.appWebObjetivo === 'otros' && wizardData.appWebObjetivoDetalle.trim() !== '');
                return wizardData.appWebObjetivo && validObjetivo && wizardData.appWebMobile && wizardData.appWebDescripcion;
            case 4: // Usuarios
                const validRoles = !wizardData.appWebRoles.includes('otros') || (wizardData.appWebRoles.includes('otros') && wizardData.appWebRolesDetalle.trim() !== '');
                return wizardData.appWebUsuarios && wizardData.appWebRoles.length > 0 && validRoles && wizardData.appWebReportes;
            default:
                return true;
        }
    }

    // Mobile App Validation
    if (selectedPlan === 'Aplicación Móvil') {
        switch (currentStep) {
            case 1: 
                return selectedPlan !== '';
            case 2: // Identidad (Reusa)
                return wizardData.businessName && wizardData.sector && wizardData.domainStatus;
            case 3: // Plataforma
                return wizardData.appMobilePlataforma && wizardData.appMobileTipo;
            case 4: // Funcionalidades
                return wizardData.appMobileFuncionalidades.length > 0 && wizardData.appMobilePublicacion;
            default:
                return true;
        }
    }
    
    // Sitio Web validation
    if (selectedPlan === 'Sitio Web') {
      switch (currentStep) {
        case 1:
          return selectedPlan !== '';
        case 2:
          return selectedSitioWebPlan !== '';
        case 3:
          return wizardData.businessName && wizardData.sector && wizardData.domainStatus;
        case 4:
          return wizardData.rucCedula && wizardData.razonSocial && wizardData.email && wizardData.telefono;
        default:
          return true;
      }
    }
    
    // Landing Page validation
    if (selectedPlan === 'Landing Page') {
        switch (currentStep) {
            case 1:
                return selectedPlan !== '';
            case 2: // Price selection
                return selectedLandingPlan !== '';
            case 3: // Identidad
                return wizardData.businessName && wizardData.sector && wizardData.domainStatus;
            case 4: // Facturación
                return wizardData.rucCedula && wizardData.razonSocial && wizardData.email && wizardData.telefono;
            default:
                return true;
        }
    }

    // Moodle Validation
    if (selectedPlan === 'Plataforma de cursos Moodle') {
        switch (currentStep) {
            case 1:
                return selectedPlan !== '';
            case 2: // Identidad
                return wizardData.businessName && wizardData.sector && wizardData.domainStatus;
            case 3: // Escala
                return wizardData.moodleUso && wizardData.moodleUsuarios;
            case 4: // Contenido
                return wizardData.moodleClases && wizardData.moodleDiseno;
            case 5: // Propuesta Logic
                 const isPathB = wizardData.moodleUsuarios !== 'bajo' || wizardData.moodleDiseno === 'a_medida' || wizardData.moodleClases === 'en_vivo';
                 if (!isPathB) {
                     return wizardData.paymentMethod !== '';
                 }
                 return true; 
            default:
                return true;
        }
    }

    // Default for other project types
    return currentStep === 1 ? selectedPlan !== '' : true;
  };

  // Get current steps based on project
  const getSteps = () => {
    if (selectedPlan === 'Sitio Web') return sitioWebSteps;
    if (selectedPlan === 'Desarrollo de Software') return softwareSteps;
    if (selectedPlan === 'Tienda Online') return ecommerceSteps;
    if (selectedPlan === 'Landing Page') return landingPageSteps;
    if (selectedPlan === 'Landing Page') return landingPageSteps;
    if (selectedPlan === 'Aplicación Web') return appWebSteps;
    if (selectedPlan === 'Aplicación Móvil') return appMobileSteps;
    if (selectedPlan === 'Plataforma de cursos Moodle') return moodleSteps;
    return genericSteps;
  };

  // Handle file upload — SECURITY: Validar tipo y tamaño
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo permitido
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes (JPG, PNG, WebP) o archivos PDF.');
      e.target.value = '';
      return;
    }

    // Validar tamaño máximo (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no puede superar los 5MB.');
      e.target.value = '';
      return;
    }

    handleWizardChange('comprobante', file);
  };

  // Handle Web App submission
  const handleSubmitWebApp = async () => {
    // Validate contact info
    if (!wizardData.softwareNombre || !wizardData.softwareEmail) {
        alert('Por favor, ingresa tu Nombre y Email para contactarte.');
        return;
    }
    
    setLoading(true);

    const recaptchaToken = await executeRecaptcha('WEBAPP');
    if (!recaptchaToken) {
        alert('Por favor, completa el ReCAPTCHA o recarga la página.');
        setLoading(false);
        return;
    }

    const webAppData = {
        appWebObjetivo: wizardData.appWebObjetivo,
        appWebObjetivoDetalle: wizardData.appWebObjetivoDetalle,
        appWebMobile: wizardData.appWebMobile,
        appWebDescripcion: wizardData.appWebDescripcion,
        appWebUsuarios: wizardData.appWebUsuarios,
        appWebRoles: wizardData.appWebRoles,
        appWebRolesDetalle: wizardData.appWebRolesDetalle,
        appWebReportes: wizardData.appWebReportes,
        
        businessName: wizardData.businessName,
        sector: wizardData.sector,
        domainStatus: wizardData.domainStatus,

        // Contact Info (reusing software fields)
        contactName: wizardData.softwareNombre,
        contactEmail: wizardData.softwareEmail,
        contactPhone: wizardData.softwareTelefono,

        projectType: 'Aplicación Web',
        recaptchaToken
    };

    try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';

        const response = await fetch(`${BACKEND_URL}/api/send-webapp-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webAppData)
        });

        if (response.ok) {
            setShowSuccessAlert(true);
            setFormSubmitted(true);
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error || 'Error al enviar la solicitud'}`);
        }
    } catch (error) {
        console.error('Error sending webapp request:', error);
        alert('Ocurrió un error al enviar la solicitud.');
    } finally {
        setLoading(false);
    }
  };



  // Handle Mobile App submission
  const handleSubmitAppMobile = async () => {
    // Validate contact info
    if (!wizardData.softwareNombre || !wizardData.softwareEmail) {
        alert('Por favor, ingresa tu Nombre y Email para contactarte.');
        return;
    }
    
    setLoading(true);

    const recaptchaToken = await executeRecaptcha('MOBILEAPP');
    if (!recaptchaToken) {
        alert('Por favor, completa el ReCAPTCHA o recarga la página.');
        setLoading(false);
        return;
    }

    const mobileAppData = {
        appMobilePlataforma: wizardData.appMobilePlataforma,
        appMobileTipo: wizardData.appMobileTipo,
        appMobileFuncionalidades: wizardData.appMobileFuncionalidades,
        appMobilePublicacion: wizardData.appMobilePublicacion,
        
        businessName: wizardData.businessName,
        sector: wizardData.sector,
        domainStatus: wizardData.domainStatus,

        // Contact Info (reusing software fields)
        contactName: wizardData.softwareNombre,
        contactEmail: wizardData.softwareEmail,
        contactPhone: wizardData.softwareTelefono,

        projectType: 'Aplicación Móvil',
        recaptchaToken
    };

    try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';

        const response = await fetch(`${BACKEND_URL}/api/send-mobileapp-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mobileAppData)
        });

        if (response.ok) {
            setShowSuccessAlert(true);
            setFormSubmitted(true);
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error || 'Error al enviar la solicitud'}`);
        }
    } catch (error) {
        console.error('Error sending mobile app request:', error);
        alert('Ocurrió un error al enviar la solicitud.');
    } finally {
        setLoading(false);
    }
  };



  // Handle Moodle submission (Institutional / Custom)
  const handleSubmitMoodle = async () => {
    // Validate contact info
    if (!wizardData.softwareNombre || !wizardData.softwareEmail) {
        alert('Por favor, ingresa tu Nombre y Email para contactarte.');
        return;
    }
    
    setLoading(true);

    const recaptchaToken = await executeRecaptcha('MOODLE');
    if (!recaptchaToken) {
        alert('Por favor, completa el ReCAPTCHA o recarga la página.');
        setLoading(false);
        return;
    }

    const moodleData = {
        moodleUso: wizardData.moodleUso,
        moodleUsuarios: wizardData.moodleUsuarios,
        moodleClases: wizardData.moodleClases,
        moodleDiseno: wizardData.moodleDiseno,
        
        businessName: wizardData.businessName,
        sector: wizardData.sector,
        domainStatus: wizardData.domainStatus,

        // Contact Info (reusing software fields)
        contactName: wizardData.softwareNombre,
        contactEmail: wizardData.softwareEmail,
        contactPhone: wizardData.softwareTelefono,

        projectType: 'Moodle Institucional',
        recaptchaToken
    };

    try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';

        const response = await fetch(`${BACKEND_URL}/api/send-moodle-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(moodleData)
        });

        if (response.ok) {
            setShowSuccessAlert(true);
            setFormSubmitted(true);
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error || 'Error al enviar la solicitud'}`);
        }
    } catch (error) {
        console.error('Error sending moodle request:', error);
        alert('Ocurrió un error al enviar la solicitud.');
    } finally {
        setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);

    // Special handling for Software Development
    if (selectedPlan === 'Desarrollo de Software') {
      const recaptchaToken = await executeRecaptcha('SOFTWARE');
      if (!recaptchaToken) {
        alert('Por favor, completa el ReCAPTCHA o recarga la página.');
        setLoading(false);
        return;
      }

      const softwareData = {
        softwareEscala: wizardData.softwareEscala,
        softwareRoles: wizardData.softwareRoles,
        softwareIntegraciones: wizardData.softwareIntegraciones,
        softwarePresupuesto: wizardData.softwarePresupuesto,
        softwareTiempo: wizardData.softwareTiempo,
        softwareNombre: wizardData.softwareNombre,
        softwareEmail: wizardData.softwareEmail,
        softwareTelefono: wizardData.softwareTelefono,
        projectType: 'Desarrollo de Software',
        recaptchaToken
      };

      try {
        // Use full URL if in production (same logic as payment)
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';

        const response = await fetch(`${BACKEND_URL}/api/send-software-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(softwareData)
        });

        if (response.ok) {
            setShowSuccessAlert(true);
            setFormSubmitted(true);
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error || 'Error al enviar la solicitud'}`);
        }
      } catch (error) {
        console.error('Error sending software request:', error);
        alert('Ocurrió un error al enviar la solicitud.');
      } finally {
        setLoading(false);
      }
      return; 
    }

    // Special handling for Web App
    if (selectedPlan === 'Aplicación Web') {
        handleSubmitWebApp();
        return;
    }

    // Special handling for Mobile App
    if (selectedPlan === 'Aplicación Móvil') {
        handleSubmitAppMobile();
        return;
    }

    // Special handling for Moodle (Only logic B - Institutional)
    if (selectedPlan === 'Plataforma de cursos Moodle') {
        const isPathB = wizardData.moodleUsuarios !== 'bajo' || wizardData.moodleDiseno === 'a_medida' || wizardData.moodleClases === 'en_vivo';
        if (isPathB) {
            handleSubmitMoodle();
            return;
        }
        // If Path A (Standard), continue to payment/default flow
    }

    const recaptchaToken = await executeRecaptcha('WIZARD_GENERIC');
    if (!recaptchaToken) {
        alert('Por favor, completa el ReCAPTCHA o recarga la página.');
        setLoading(false);
        return;
    }

    try {
      // Track completion
      ReactGA.event({
        category: 'Planes',
        action: 'wizard_completado',
        label: selectedPlan,
        value: wizardData.budget
      });

      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('trackCustom', 'WizardCompletado', {
          tipo: selectedPlan,
          presupuesto: wizardData.budget
        });
      }

      // Submit form data
      const formDataToSend = new FormData();
      Object.keys(wizardData).forEach(key => {
        if (wizardData[key] !== null) {
          formDataToSend.append(key, wizardData[key]);
        }
      });
      formDataToSend.append('plan', selectedPlan);
      formDataToSend.append('g-recaptcha-response', recaptchaToken);

      // SECURITY: Migrado de guardar_datos.php legacy a la API Node.js centralizada
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
      const response = await fetch(`${BACKEND_URL}/api/save-wizard-data`, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        setShowSuccessAlert(true);
        setFormSubmitted(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Error al enviar la información.'}`);
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      alert('Ocurrió un error al enviar el formulario.');
    } finally {
      setLoading(false);
    }
  };

  // Render Step 1 - Project Selection
  const renderStep1 = () => (
    <div className="wizard-step-content">
      <h2 id="wizard-project-title">¿Qué tipo de proyecto planificas?</h2>
      <p className="wizard-subtitle">
        Selecciona el tipo principal de proyecto que deseas construir.
      </p>

      <div className="project-cards-grid">
        {projectTypes.map((project, index) => (
          <div
            key={index}
            className={`project-card ${selectedPlan === project.id ? 'active' : ''}`}
            onClick={() => handleProjectSelect(project.id)}
          >
            <div className="project-card-icon">
              {project.icon}
            </div>
            <h4>{project.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );

  // === RENDER LANDING PAGE PRICE CARDS ===
  const renderLandingPriceCards = () => (
    <div className={`landing-price-section ${showLandingPrices ? 'visible' : ''}`}>
      <h2>Páginas de Venta · Campañas de Alto Impacto</h2>
      <p className="wizard-subtitle">
        Selecciona la landing page ideal para tu campaña o producto.
      </p>

      <div className="landing-price-cards three-columns">
        {landingPriceCards.map((card) => (
          <div
            key={card.id}
            className={`price-card ${selectedLandingPlan === card.id ? 'selected' : ''}`}
            onClick={() => handleLandingPlanSelect(card.id)}
          >
            {/* Plan Name */}
            <h3 className="price-card-name">{card.label}</h3>

            {/* Description */}
            <p className="price-card-description">{card.description}</p>

            {/* Price */}
            <div className="price-card-price">
              {card.originalPrice && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)" }}>antes</span>
                  <span
                    style={{
                      fontSize: "18px",
                      textDecoration: "line-through",
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    ${card.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 800,
                      letterSpacing: "0.3px",
                      background: "linear-gradient(135deg, #ff4d4d, #f7b733)",
                      color: "#fff",
                      boxShadow: "0 6px 16px rgba(255, 77, 77, 0.35)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    AHORRA {card.discount}%
                  </span>
                </div>
              )}
              ${card.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            {/* Features */}
            <ul className="price-card-features">
              {card.features.map((feature, idx) => {
                const key = `landing-${card.id}-${idx}`;
                const isOpen = !!openFeatures[key];
                const hasDesc = feature.description !== null;
                return (
                  <li key={idx} className={`feature-accordion-item${hasDesc ? ' has-desc' : ''}`}>
                    <button
                      type="button"
                      className="feature-accordion-trigger"
                      onClick={(e) => { e.stopPropagation(); if (hasDesc) toggleFeature(key); }}
                      style={{ cursor: hasDesc ? 'pointer' : 'default' }}
                    >
                      <span className="feature-check">✓</span>
                      <span className="feature-title">{feature.title}</span>
                      {hasDesc && <span className="feature-arrow">{isOpen ? '▲' : '▼'}</span>}
                    </button>
                    {hasDesc && isOpen && (
                      <p className="feature-accordion-body">{feature.description}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  // === RENDER LANDING PAGE BILLING ===
  const renderLandingBilling = () => (
    <div className="wizard-step-content billing-extended">
      <h2>Datos de Facturación</h2>
      <p className="wizard-subtitle">Información para completar tu pedido.</p>
      
      {/* ===== SECCIÓN 1: DATOS DE IDENTIFICACIÓN ===== */}
      <div className="billing-section">
        <h3 className="billing-section-title">Datos de Identificación del Cliente</h3>
        <div className="wizard-form-grid">
          {/* Tipo de Cliente */}
          <div className="form-field full-width">
            <label>Tipo de Cliente *</label>
            <div className="radio-group-horizontal">
              <label className={`radio-option ${wizardData.tipoCliente === 'consumidor_final' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  checked={wizardData.tipoCliente === 'consumidor_final'} 
                  onChange={() => handleWizardChange('tipoCliente', 'consumidor_final')} 
                />
                <span className="radio-label">Consumidor Final (Persona Natural)</span>
              </label>
              <label className={`radio-option ${wizardData.tipoCliente === 'empresa' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  checked={wizardData.tipoCliente === 'empresa'} 
                  onChange={() => handleWizardChange('tipoCliente', 'empresa')} 
                />
                <span className="radio-label">Empresa (Persona Jurídica)</span>
              </label>
            </div>
          </div>

          {/* RUC o Cédula */}
          <div className="form-field">
            <label>{wizardData.tipoCliente === 'empresa' ? 'Identificación Fiscal *' : 'Documento de Identidad *'}</label>
            <input
              type="text"
              value={wizardData.rucCedula || ''}
              onChange={(e) => handleWizardChange('rucCedula', e.target.value)}
              placeholder={wizardData.tipoCliente === 'empresa' ? 'Ej: 1790012345001' : 'Ej: 1712345678'}
              maxLength={wizardData.tipoCliente === 'empresa' ? 13 : 10}
            />
          </div>

          {/* Razón Social / Nombre */}
          <div className="form-field">
            <label>{wizardData.tipoCliente === 'empresa' ? 'Razón Social *' : 'Nombre Completo *'}</label>
            <input
              type="text"
              value={wizardData.razonSocial || ''}
              onChange={(e) => handleWizardChange('razonSocial', e.target.value)}
              placeholder={wizardData.tipoCliente === 'empresa' ? 'Nombre registrado de la empresa' : 'Nombre y apellido completo'}
            />
          </div>
        </div>
      </div>

      {/* ===== SECCIÓN 2: DATOS DE CONTACTO ===== */}
      <div className="billing-section">
        <h3 className="billing-section-title">Datos de Contacto</h3>
        <div className="wizard-form-grid">
          {/* Email */}
          <div className="form-field">
            <label>Correo Electrónico *</label>
            <input
              type="email"
              value={wizardData.email || ''}
              onChange={(e) => handleWizardChange('email', e.target.value)}
              placeholder="tu@email.com"
            />
            <span className="field-hint">Aquí recibirás el comprobante XML/PDF y el enlace a tu carpeta de Google Drive</span>
          </div>

          {/* Teléfono */}
          <div className="form-field">
            <label>Teléfono *</label>
            <input
              type="tel"
              value={wizardData.telefono || ''}
              onChange={(e) => handleWizardChange('telefono', e.target.value)}
              placeholder="Tu número de teléfono"
            />
          </div>
        </div>
      </div>

      {/* ===== SECCIÓN 3: DIRECCIÓN DE FACTURACIÓN ===== */}
      <div className="billing-section">
        <h3 className="billing-section-title">Dirección de Facturación</h3>
        <div className="wizard-form-grid">
          {/* Calle Principal */}
          <div className="form-field">
            <label>Calle Principal y Número *</label>
            <input
              type="text"
              value={wizardData.callePrincipal || ''}
              onChange={(e) => handleWizardChange('callePrincipal', e.target.value)}
              placeholder="Ej: Av. Amazonas N34-86"
            />
          </div>

          {/* Calle Secundaria / Referencia */}
          <div className="form-field">
            <label>Calle Secundaria / Referencia</label>
            <input
              type="text"
              value={wizardData.calleSecundaria || ''}
              onChange={(e) => handleWizardChange('calleSecundaria', e.target.value)}
              placeholder="Ej: y Av. República"
            />
          </div>

          {/* Ciudad */}
          <div className="form-field">
            <label>Ciudad / Cantón *</label>
            <input
              type="text"
              value={wizardData.ciudad || ''}
              onChange={(e) => handleWizardChange('ciudad', e.target.value)}
              placeholder="Ej: tu ciudad"
            />
          </div>

          {/* Provincia */}
          <div className="form-field">
            <label>Provincia *</label>
            <select
              value={wizardData.provincia || ''}
              onChange={(e) => handleWizardChange('provincia', e.target.value)}
              className="wizard-select"
            >
              <option value="">Selecciona...</option>
              <option value="Azuay">Azuay</option>
              <option value="Bolívar">Bolívar</option>
              <option value="Cañar">Cañar</option>
              <option value="Carchi">Carchi</option>
              <option value="Chimborazo">Chimborazo</option>
              <option value="Cotopaxi">Cotopaxi</option>
              <option value="El Oro">El Oro</option>
              <option value="Esmeraldas">Esmeraldas</option>
              <option value="Galápagos">Galápagos</option>
              <option value="Guayas">Guayas</option>
              <option value="Imbabura">Imbabura</option>
              <option value="Loja">Loja</option>
              <option value="Los Ríos">Los Ríos</option>
              <option value="Manabí">Manabí</option>
              <option value="Morona Santiago">Morona Santiago</option>
              <option value="Napo">Napo</option>
              <option value="Orellana">Orellana</option>
              <option value="Pastaza">Pastaza</option>
              <option value="Pichincha">Pichincha</option>
              <option value="Santa Elena">Santa Elena</option>
              <option value="Santo Domingo de los Tsáchilas">Santo Domingo de los Tsáchilas</option>
              <option value="Sucumbíos">Sucumbíos</option>
              <option value="Tungurahua">Tungurahua</option>
              <option value="Zamora Chinchipe">Zamora Chinchipe</option>
            </select>
          </div>

          {/* Código Postal */}
          <div className="form-field">
            <label>Código Postal</label>
            <input
              type="text"
              value={wizardData.codigoPostal || ''}
              onChange={(e) => handleWizardChange('codigoPostal', e.target.value)}
              placeholder="Ej: 170150"
              maxLength={6}
            />
          </div>

          {/* País */}
          <div className="form-field">
            <label>País *</label>
            <input
              type="text"
              value={wizardData.pais || ''}
              onChange={(e) => handleWizardChange('pais', e.target.value)}
              placeholder="Tu país"
            />
          </div>
        </div>
      </div>

      {/* ===== SECCIÓN 4: MÉTODO DE PAGO ===== */}
      <div className="billing-section">
        <h3 className="billing-section-title">Método de Pago</h3>
        
        {/* Selector de tipo de pago (Anticipo / Total) */}
        <div className="payment-type-selector">
          <label className="payment-type-label">Selecciona el tipo de pago:</label>
          <div className="payment-type-buttons">
            <button
              type="button"
              className={`payment-type-btn ${wizardData.tipoPago === 'total' ? 'active' : ''}`}
              onClick={() => handleWizardChange('tipoPago', 'total')}
            >
              <span className="payment-type-name">Pago Total</span>
              <span className="payment-type-amount">
                ${formatPrice(selectedLandingPlan ? landingPriceCards.find(c => c.id === selectedLandingPlan)?.price || 80 : 80)} USD
              </span>
              <span className="payment-type-badge">100%</span>
            </button>
            <button
              type="button"
              className={`payment-type-btn ${wizardData.tipoPago === 'anticipo' ? 'active' : ''}`}
              onClick={() => handleWizardChange('tipoPago', 'anticipo')}
            >
              <span className="payment-type-name">Anticipo</span>
              <span className="payment-type-amount">
                ${formatPrice(Math.round((selectedLandingPlan ? landingPriceCards.find(c => c.id === selectedLandingPlan)?.price || 80 : 80) / 2))} USD
              </span>
              <span className="payment-type-badge anticipo">50%</span>
            </button>
          </div>
          {wizardData.tipoPago === 'anticipo' && (
            <p className="anticipo-note">
              * El 50% restante se pagará al momento de la entrega del proyecto.
            </p>
          )}
        </div>
        
        {/* Botones de selección de método */}
        <div className="payment-method-buttons">
          <button
            type="button"
            className={`payment-method-btn ${wizardData.metodoPago === 'tarjeta' ? 'active' : ''}`}
            onClick={() => handleWizardChange('metodoPago', 'tarjeta')}
          >
            <FaCreditCard />
            <span>Tarjeta de Crédito/Débito</span>
          </button>
          <button
            type="button"
            className={`payment-method-btn ${wizardData.metodoPago === 'transferencia' ? 'active' : ''}`}
            onClick={() => handleWizardChange('metodoPago', 'transferencia')}
          >
            <FaExchangeAlt />
            <span>Transferencia Bancaria</span>
          </button>
        </div>

        {/* Contenido según método seleccionado */}
        {wizardData.metodoPago === 'tarjeta' && (
          <div className="payment-content card-payment">
            <div className="payment-info-card">
              <p className="payment-security-note">Pago seguro procesado por PayPhone</p>
              
              {(() => {
                const basePrice = landingPriceCards.find(c => c.id === selectedLandingPlan)?.price || 80;
                let subtotal = wizardData.tipoPago === 'anticipo' ? Math.round(basePrice / 2) : basePrice;
                const canDefer = wizardData.tipoPago !== 'anticipo';
                
                const cardFee = subtotal * 0.05;
                const finalTotal = Math.round(subtotal + cardFee); // Interés de diferido lo suma el Banco
                const monthlyPayment = wizardData.deferredMonths > 0 ? Math.round(finalTotal / wizardData.deferredMonths * 100) / 100 : 0;

                return (
                  <>
                    {canDefer && (
                      <div className="deferral-options-container" style={{ margin: '15px 0', padding: '15px', backgroundColor: 'rgba(239, 162, 56, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 162, 56, 0.2)' }}>
                        <h5 style={{ margin: '0 0 10px 0', color: '#efa238', fontSize: '14px' }}>Opciones de diferido:</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                          {[
                            { value: 0, label: '1 Pago', sub: 'Corriente' },
                            { value: 3, label: '3 Meses', sub: 'Con interés del banco' },
                            { value: 6, label: '6 Meses', sub: 'Con interés del banco' },
                            { value: 12, label: '12 Meses', sub: 'Con interés del banco' }
                          ].map(option => (
                            <div 
                              key={option.value}
                              onClick={() => handleWizardChange('deferredMonths', option.value)}
                              style={{ 
                                padding: '8px', 
                                textAlign: 'center', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                border: wizardData.deferredMonths === option.value ? '1px solid #efa238' : '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: wizardData.deferredMonths === option.value ? 'rgba(239, 162, 56, 0.2)' : 'rgba(255,255,255,0.02)',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{ fontWeight: 'bold', fontSize: '13px', color: wizardData.deferredMonths === option.value ? '#fff' : '#ccc' }}>{option.label}</div>
                              <div style={{ fontSize: '11px', color: wizardData.deferredMonths === option.value ? '#efa238' : '#888' }}>{option.sub}</div>
                            </div>
                          ))}
                        </div>
                        
                        {wizardData.deferredMonths > 0 && (
                          <div style={{ marginTop: '12px', padding: '10px', fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #ff9800', color: '#ddd' }}>
                            <strong>⚠️ Importante:</strong> Para diferir, debes ingresar una <strong>tarjeta de crédito</strong> de los siguientes bancos habilitados:
                            <ul style={{ margin: '8px 0 4px 0', paddingLeft: '18px', lineHeight: '1.6', columns: 2, columnGap: '10px' }}>
                              <li>Produbanco (Visa / MC)</li>
                              <li>Amazonas (Visa)</li>
                              <li>Bolivariano (Visa / MC)</li>
                              <li>Internacional (Visa / MC)</li>
                              <li>Mutualista Azuay (Visa)</li>
                              <li>Mutualista Imbabura (Visa)</li>
                              <li>Machala (Visa / MC)</li>
                              <li>BBP Bank (Visa)</li>
                              <li>Coop. JEP (Visa / MC)</li>
                              <li>Coop. Oscus (Visa / MC)</li>
                              <li>Coop. Pilahuinito (Visa)</li>
                            </ul>
                            <span style={{ fontSize: '11px', color: '#aaa' }}>El cálculo final de cuotas e intereses dependerá de tu banco. Verás el valor exacto en PayPhone.</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="payment-note" style={{ marginBottom: '5px' }}>
                      Subtotal: <strong>${formatPrice(subtotal)} USD</strong>
                    </p>
                    
                    <p className="payment-note" style={{ marginBottom: '5px', fontSize: '0.9em', color: '#ff9800' }}>
                      + 5% Comisión Tarjeta: <strong>${formatPrice(cardFee)} USD</strong>
                    </p>
                    
                    <p className="payment-note" style={{ fontSize: '1.2em' }}>
                      Base a pagar: <strong>${formatPrice(finalTotal)} USD</strong>
                    </p>

                    {wizardData.deferredMonths > 0 && (
                      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '5px', borderLeft: '4px solid #efa238' }}>
                        <p style={{ margin: 0, fontSize: '1.1em' }}>
                          Mensualidad estimada: <strong style={{ color: '#efa238' }}>~ ${formatPrice(monthlyPayment)} / mes</strong> ({wizardData.deferredMonths} cuotas)
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            
            {/* Show payment window open message */}
            {paymentWindowOpen && (
              <div className="payment-window-open-notice">
                <div className="payment-window-icon">🔄</div>
                <h4>Ventana de pago abierta</h4>
                <p>Completa el pago en la ventana emergente de PayPhone.</p>
              </div>
            )}
            
            {/* Show checking payment message */}
            {checkingPayment && (
              <div className="payment-checking-notice">
                <div className="payment-checking-spinner"></div>
                <p>Verificando tu pago y enviando confirmación...</p>
              </div>
            )}
            
            {/* Terms Checkbox */}
            {!paymentWindowOpen && !checkingPayment && (
              <div className="terms-checkbox-container" style={{ margin: '15px 0', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="checkbox" 
                  id="terms-check-card" 
                  checked={termsAccepted} 
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="terms-check-card" style={{ fontSize: '14px', color: '#555', cursor: 'pointer' }}>
                  Acepto los <a href="/politicas-playconsole/" target="_blank" rel="noopener noreferrer" style={{ color: '#600b56', textDecoration: 'underline' }}>Términos y Condiciones</a> y la Política de Privacidad.
                </label>
              </div>
            )}

            {/* Main payment button or confirmation button */}
            {!paymentWindowOpen && !checkingPayment && (
              <button 
                type="button"
                className="btn-payphone"
                onClick={handlePayPhonePayment}
                disabled={!termsAccepted || isSubmitting || !wizardData.tipoCliente || !wizardData.rucCedula || !wizardData.razonSocial || !wizardData.email || !wizardData.telefono || !wizardData.callePrincipal || !wizardData.ciudad || !wizardData.provincia}
              >
                <FaCreditCard style={{ marginRight: '10px' }} />
                {(() => {
                  const basePrice = landingPriceCards.find(c => c.id === selectedLandingPlan)?.price || 80;
                  let subtotal = wizardData.tipoPago === 'anticipo' ? Math.round(basePrice / 2) : basePrice;
                  const finalTotal = Math.round(subtotal * 1.05);
                  return isSubmitting ? 'Procesando...' : `Pagar $${formatPrice(finalTotal)} con Tarjeta`;
                })()}
              </button>
            )}

          </div>
        )}

        {wizardData.metodoPago === 'transferencia' && (
          <div className="payment-content transfer-payment">
            <div className="transfer-amount-notice">
              <p>Monto a transferir: <strong>${wizardData.tipoPago === 'anticipo'
                ? Math.round((landingPriceCards.find(c => c.id === selectedLandingPlan)?.price || 80) / 2)
                : (landingPriceCards.find(c => c.id === selectedLandingPlan)?.price || 80)} USD</strong></p>
            </div>
            <div className="bank-details-card">
              <h4>Datos Bancarios para Transferencia</h4>
              <div className="bank-info-grid">
                <div className="bank-info-item">
                  <span className="label">Banco:</span>
                  <span className="value">Pichincha</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">Nombres:</span>
                  <span className="value">Christopher Alexander Gallardo Campos</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">Cédula:</span>
                  <span className="value">1727155671</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">N° de cuenta:</span>
                  <span className="value">2212385867</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">Tipo de cuenta:</span>
                  <span className="value">Ahorros</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">Celular:</span>
                  <span className="value">0999739534</span>
                </div>
              </div>
              <div className="whatsapp-notice">
                <span>Por favor enviar el comprobante al WhatsApp: <strong>0999739534</strong></span>
              </div>
            </div>

            {/* Subir Comprobante */}
            <div className="form-field upload-field">
              <label>Adjuntar Comprobante de Pago *</label>
              <div className="file-upload-zone">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Validate size (5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        alert('El archivo es demasiado grande. Máximo 5MB.');
                        return;
                      }
                      // Just save file to state, upload happens on submit
                      handleWizardChange('comprobante', file);
                    }
                  }}
                  id="comprobante-upload-landing"
                />
                <label htmlFor="comprobante-upload-landing" className="file-upload-label">
                  <FaUpload />
                  <span>{wizardData.comprobante ? 'Comprobante cargado exitosamente' : 'Arrastra o haz clic para subir el comprobante'}</span>
                </label>
              </div>
            </div>

            {/* Terms Checkbox - Transfer */}
            <div className="terms-checkbox-container" style={{ margin: '15px 0', display: 'flex', alignItems: 'center' }}>
              <input 
                type="checkbox" 
                id="terms-check-transfer" 
                checked={termsAccepted} 
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="terms-check-transfer" style={{ fontSize: '14px', color: '#555', cursor: 'pointer' }}>
                Acepto los <a href="/politicas-playconsole/" target="_blank" rel="noopener noreferrer" style={{ color: '#600b56', textDecoration: 'underline' }}>Términos y Condiciones</a> y la Política de Privacidad.
              </label>
            </div>

            {/* Botón de confirmar pedido */}
            <button 
              type="button"
              className="btn-confirm-transfer"
              onClick={handleTransferSubmit}
              disabled={!termsAccepted || isSubmitting || !wizardData.tipoCliente || !wizardData.rucCedula || !wizardData.razonSocial || !wizardData.email || !wizardData.telefono || !wizardData.callePrincipal || !wizardData.ciudad || !wizardData.provincia || !wizardData.comprobante}
            >
              <FaCheck style={{ marginRight: '10px' }} />
              {isSubmitting ? 'Enviando pedido...' : 'Confirmar Pedido'}
            </button>
          </div>
        )}
      </div>

      {/* ===== RESUMEN DEL PEDIDO ===== */}
      <div className="order-summary" style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: 'rgba(239, 162, 56, 0.1)', 
        borderRadius: '12px',
        borderLeft: '4px solid #efa238'
      }}>
        <h3 style={{ color: '#efa238', marginBottom: '15px' }}>Resumen del Pedido</h3>
      </div>
    </div>
  );

  // === RENDER SITIO WEB PRICE CARDS ===
  const renderSitioWebPriceCards = () => (
    <div className={`landing-price-section ${showSitioWebPrices ? 'visible' : ''}`}>
      <h2>Elige tu plan de Sitio Web</h2>
      <p className="wizard-subtitle">
        Selecciona el plan que mejor se adapte a tus necesidades.
      </p>

      <div className="landing-price-cards three-columns">
        {sitioWebPriceCards.map((card) => (
          <div
            key={card.id}
            className={`price-card ${selectedSitioWebPlan === card.id ? 'selected' : ''}`}
            onClick={() => handleSitioWebPlanSelect(card.id)}
          >
            {/* Plan Name */}
            <h3 className="price-card-name">{card.label}</h3>

            {/* Description */}
            <p className="price-card-description">{card.description}</p>

            {/* Price */}
            <div className="price-card-price">
              {card.originalPrice && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)" }}>antes</span>
                  <span
                    style={{
                      fontSize: "18px",
                      textDecoration: "line-through",
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    ${card.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 800,
                      letterSpacing: "0.3px",
                      background: "linear-gradient(135deg, #ff4d4d, #f7b733)",
                      color: "#fff",
                      boxShadow: "0 6px 16px rgba(255, 77, 77, 0.35)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    AHORRA {card.discount}%
                  </span>
                </div>
              )}
              ${card.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            {/* Features */}
            <ul className="price-card-features">
              {card.features.map((feature, idx) => {
                const key = `web-${card.id}-${idx}`;
                const isOpen = !!openFeatures[key];
                const hasDesc = feature.description !== null;
                return (
                  <li key={idx} className={`feature-accordion-item${hasDesc ? ' has-desc' : ''}`}>
                    <button
                      type="button"
                      className="feature-accordion-trigger"
                      onClick={(e) => { e.stopPropagation(); if (hasDesc) toggleFeature(key); }}
                      style={{ cursor: hasDesc ? 'pointer' : 'default' }}
                    >
                      <span className="feature-check">✓</span>
                      <span className="feature-title">{feature.title}</span>
                      {hasDesc && <span className="feature-arrow">{isOpen ? '▲' : '▼'}</span>}
                    </button>
                    {hasDesc && isOpen && (
                      <p className="feature-accordion-body">{feature.description}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  // === RENDER SITIO WEB BILLING ===
  const renderSitioWebBilling = () => (
    <div className="wizard-step-content billing-extended">
      <h2>Datos de Facturación</h2>
      <p className="wizard-subtitle">Información para completar tu pedido.</p>
      
      {/* ===== SECCIÓN 1: DATOS DE IDENTIFICACIÓN ===== */}
      <div className="billing-section">
        <h3 className="billing-section-title">Datos de Identificación del Cliente</h3>
        <div className="wizard-form-grid">
          {/* Tipo de Cliente */}
          <div className="form-field full-width">
            <label>Tipo de Cliente *</label>
            <div className="radio-group-horizontal">
              <label className={`radio-option ${wizardData.tipoCliente === 'consumidor_final' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  checked={wizardData.tipoCliente === 'consumidor_final'} 
                  onChange={() => handleWizardChange('tipoCliente', 'consumidor_final')} 
                />
                <span className="radio-label">Consumidor Final (Persona Natural)</span>
              </label>
              <label className={`radio-option ${wizardData.tipoCliente === 'empresa' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  checked={wizardData.tipoCliente === 'empresa'} 
                  onChange={() => handleWizardChange('tipoCliente', 'empresa')} 
                />
                <span className="radio-label">Empresa (Persona Jurídica)</span>
              </label>
            </div>
          </div>

          {/* RUC o Cédula */}
          <div className="form-field">
            <label>{wizardData.tipoCliente === 'empresa' ? 'Identificación Fiscal *' : 'Documento de Identidad *'}</label>
            <input
              type="text"
              value={wizardData.rucCedula || ''}
              onChange={(e) => handleWizardChange('rucCedula', e.target.value)}
              placeholder={wizardData.tipoCliente === 'empresa' ? 'Ej: 1790012345001' : 'Ej: 1712345678'}
              maxLength={wizardData.tipoCliente === 'empresa' ? 13 : 10}
            />
          </div>

          {/* Razón Social / Nombre */}
          <div className="form-field">
            <label>{wizardData.tipoCliente === 'empresa' ? 'Razón Social *' : 'Nombre Completo *'}</label>
            <input
              type="text"
              value={wizardData.razonSocial || ''}
              onChange={(e) => handleWizardChange('razonSocial', e.target.value)}
              placeholder={wizardData.tipoCliente === 'empresa' ? 'Nombre registrado de la empresa' : 'Nombre y apellido completo'}
            />
          </div>

          {/* Correo Electrónico */}
          <div className="form-field">
            <label>Correo Electrónico *</label>
            <input
              type="email"
              value={wizardData.email || ''}
              onChange={(e) => handleWizardChange('email', e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>

          {/* Teléfono */}
          <div className="form-field">
            <label>Teléfono (WhatsApp) *</label>
            <input
              type="tel"
              value={wizardData.telefono || ''}
              onChange={(e) => handleWizardChange('telefono', e.target.value)}
              placeholder="Tu número de teléfono"
            />
          </div>
        </div>
      </div>

      {/* ===== SECCIÓN 2: DIRECCIÓN ===== */}
      <div className="billing-section">
        <h3 className="billing-section-title">Dirección de Facturación</h3>
        <div className="wizard-form-grid">
          {/* Calle Principal */}
          <div className="form-field">
            <label>Calle Principal *</label>
            <input
              type="text"
              value={wizardData.callePrincipal || ''}
              onChange={(e) => handleWizardChange('callePrincipal', e.target.value)}
              placeholder="Ej: Av. Amazonas"
            />
          </div>
          
          {/* Calle Secundaria */}
          <div className="form-field">
            <label>Calle Secundaria</label>
            <input
              type="text"
              value={wizardData.calleSecundaria || ''}
              onChange={(e) => handleWizardChange('calleSecundaria', e.target.value)}
              placeholder="Ej: N32-15"
            />
          </div>

          {/* Ciudad */}
          <div className="form-field">
            <label>Ciudad *</label>
            <input
              type="text"
              value={wizardData.ciudad || ''}
              onChange={(e) => handleWizardChange('ciudad', e.target.value)}
              placeholder="Ej: tu ciudad"
            />
          </div>

          {/* Provincia */}
          <div className="form-field">
            <label>Provincia *</label>
            <select
              value={wizardData.provincia || ''}
              onChange={(e) => handleWizardChange('provincia', e.target.value)}
              className="wizard-select"
            >
              <option value="">Seleccione una provincia...</option>
              <option value="Azuay">Azuay</option>
              <option value="Bolívar">Bolívar</option>
              <option value="Cañar">Cañar</option>
              <option value="Carchi">Carchi</option>
              <option value="Chimborazo">Chimborazo</option>
              <option value="Cotopaxi">Cotopaxi</option>
              <option value="El Oro">El Oro</option>
              <option value="Esmeraldas">Esmeraldas</option>
              <option value="Galápagos">Galápagos</option>
              <option value="Guayas">Guayas</option>
              <option value="Imbabura">Imbabura</option>
              <option value="Loja">Loja</option>
              <option value="Los Ríos">Los Ríos</option>
              <option value="Manabí">Manabí</option>
              <option value="Morona Santiago">Morona Santiago</option>
              <option value="Napo">Napo</option>
              <option value="Orellana">Orellana</option>
              <option value="Pastaza">Pastaza</option>
              <option value="Pichincha">Pichincha</option>
              <option value="Santa Elena">Santa Elena</option>
              <option value="Santo Domingo de los Tsáchilas">Santo Domingo de los Tsáchilas</option>
              <option value="Sucumbíos">Sucumbíos</option>
              <option value="Tungurahua">Tungurahua</option>
              <option value="Zamora Chinchipe">Zamora Chinchipe</option>
            </select>
          </div>

          {/* Código Postal */}
          <div className="form-field">
            <label>Código Postal</label>
            <input
              type="text"
              value={wizardData.codigoPostal || ''}
              onChange={(e) => handleWizardChange('codigoPostal', e.target.value)}
              placeholder="Ej: 170150"
              maxLength={6}
            />
          </div>

          {/* País */}
          <div className="form-field">
            <label>País *</label>
            <input
              type="text"
              value={wizardData.pais || ''}
              onChange={(e) => handleWizardChange('pais', e.target.value)}
              placeholder="Tu país"
            />
          </div>
        </div>
      </div>

      {/* ===== SECCIÓN 4: MÉTODO DE PAGO ===== */}
      <div className="billing-section">
        <h3 className="billing-section-title">Método de Pago</h3>
        
        {/* Selector de tipo de pago (Anticipo / Total) */}
        <div className="payment-type-selector">
          <label className="payment-type-label">Selecciona el tipo de pago:</label>
          <div className="payment-type-buttons">
            <button
              type="button"
              className={`payment-type-btn ${wizardData.tipoPago === 'total' ? 'active' : ''}`}
              onClick={() => handleWizardChange('tipoPago', 'total')}
            >
              <span className="payment-type-name">Pago Total</span>
              <span className="payment-type-amount">
                ${formatPrice(selectedSitioWebPlan ? sitioWebPriceCards.find(c => c.id === selectedSitioWebPlan)?.price || 360 : 360)} USD
              </span>
              <span className="payment-type-badge">100%</span>
            </button>
            <button
              type="button"
              className={`payment-type-btn ${wizardData.tipoPago === 'anticipo' ? 'active' : ''}`}
              onClick={() => handleWizardChange('tipoPago', 'anticipo')}
            >
              <span className="payment-type-name">Anticipo</span>
              <span className="payment-type-amount">
                ${formatPrice(Math.round((selectedSitioWebPlan ? sitioWebPriceCards.find(c => c.id === selectedSitioWebPlan)?.price || 360 : 360) / 2))} USD
              </span>
              <span className="payment-type-badge anticipo">50%</span>
            </button>
          </div>
          {wizardData.tipoPago === 'anticipo' && (
            <p className="anticipo-note">
              * El 50% restante se pagará al momento de la entrega del proyecto.
            </p>
          )}
        </div>
        
        {/* Botones de selección de método */}
        <div className="payment-method-buttons">
          <button
            type="button"
            className={`payment-method-btn ${wizardData.metodoPago === 'tarjeta' ? 'active' : ''}`}
            onClick={() => handleWizardChange('metodoPago', 'tarjeta')}
          >
            <FaCreditCard />
            <span>Tarjeta de Crédito/Débito</span>
          </button>
          <button
            type="button"
            className={`payment-method-btn ${wizardData.metodoPago === 'transferencia' ? 'active' : ''}`}
            onClick={() => handleWizardChange('metodoPago', 'transferencia')}
          >
            <FaExchangeAlt />
            <span>Transferencia Bancaria</span>
          </button>
        </div>

        {/* Contenido según método seleccionado */}
        {wizardData.metodoPago === 'tarjeta' && (
          <div className="payment-content card-payment">
            <div className="payment-info-card">
              <p className="payment-security-note">Pago seguro procesado por PayPhone</p>
              
              {(() => {
                const basePrice = sitioWebPriceCards.find(c => c.id === selectedSitioWebPlan)?.price || 360;
                let subtotal = wizardData.tipoPago === 'anticipo' ? Math.round(basePrice / 2) : basePrice;
                const canDefer = wizardData.tipoPago !== 'anticipo';
                
                const cardFee = subtotal * 0.05;
                const finalTotal = Math.round(subtotal + cardFee); // Interés de diferido lo suma el Banco
                const monthlyPayment = wizardData.deferredMonths > 0 ? Math.round(finalTotal / wizardData.deferredMonths * 100) / 100 : 0;

                return (
                  <>
                    {canDefer && (
                      <div className="deferral-options-container" style={{ margin: '15px 0', padding: '15px', backgroundColor: 'rgba(239, 162, 56, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 162, 56, 0.2)' }}>
                        <h5 style={{ margin: '0 0 10px 0', color: '#efa238', fontSize: '14px' }}>Opciones de diferido:</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                          {[
                            { value: 0, label: '1 Pago', sub: 'Corriente' },
                            { value: 3, label: '3 Meses', sub: 'Con interés del banco' },
                            { value: 6, label: '6 Meses', sub: 'Con interés del banco' },
                            { value: 12, label: '12 Meses', sub: 'Con interés del banco' }
                          ].map(option => (
                            <div 
                              key={option.value}
                              onClick={() => handleWizardChange('deferredMonths', option.value)}
                              style={{ 
                                padding: '8px', 
                                textAlign: 'center', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                border: wizardData.deferredMonths === option.value ? '1px solid #efa238' : '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: wizardData.deferredMonths === option.value ? 'rgba(239, 162, 56, 0.2)' : 'rgba(255,255,255,0.02)',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{ fontWeight: 'bold', fontSize: '13px', color: wizardData.deferredMonths === option.value ? '#fff' : '#ccc' }}>{option.label}</div>
                              <div style={{ fontSize: '11px', color: wizardData.deferredMonths === option.value ? '#efa238' : '#888' }}>{option.sub}</div>
                            </div>
                          ))}
                        </div>
                        
                        {wizardData.deferredMonths > 0 && (
                          <div style={{ marginTop: '12px', padding: '10px', fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #ff9800', color: '#ddd' }}>
                            <strong>⚠️ Importante:</strong> Para diferir, debes ingresar una <strong>tarjeta de crédito</strong> de los siguientes bancos habilitados:
                            <ul style={{ margin: '8px 0 4px 0', paddingLeft: '18px', lineHeight: '1.6', columns: 2, columnGap: '10px' }}>
                              <li>Produbanco (Visa / MC)</li>
                              <li>Amazonas (Visa)</li>
                              <li>Bolivariano (Visa / MC)</li>
                              <li>Internacional (Visa / MC)</li>
                              <li>Mutualista Azuay (Visa)</li>
                              <li>Mutualista Imbabura (Visa)</li>
                              <li>Machala (Visa / MC)</li>
                              <li>BBP Bank (Visa)</li>
                              <li>Coop. JEP (Visa / MC)</li>
                              <li>Coop. Oscus (Visa / MC)</li>
                              <li>Coop. Pilahuinito (Visa)</li>
                            </ul>
                            <span style={{ fontSize: '11px', color: '#aaa' }}>El cálculo final de cuotas e intereses dependerá de tu banco. Verás el valor exacto en PayPhone.</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="payment-note" style={{ marginBottom: '5px' }}>
                      Subtotal: <strong>${formatPrice(subtotal)} USD</strong>
                    </p>
                    
                    <p className="payment-note" style={{ marginBottom: '5px', fontSize: '0.9em', color: '#ff9800' }}>
                      + 5% Comisión Tarjeta: <strong>${formatPrice(cardFee)} USD</strong>
                    </p>
                    
                    <p className="payment-note" style={{ fontSize: '1.2em' }}>
                      Base a pagar: <strong>${formatPrice(finalTotal)} USD</strong>
                    </p>

                    {wizardData.deferredMonths > 0 && (
                      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '5px', borderLeft: '4px solid #efa238' }}>
                        <p style={{ margin: 0, fontSize: '1.1em' }}>
                          Mensualidad estimada: <strong style={{ color: '#efa238' }}>~ ${formatPrice(monthlyPayment)} / mes</strong> ({wizardData.deferredMonths} cuotas)
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            
            {/* Show payment window open message */}
            {paymentWindowOpen && (
              <div className="payment-window-open-notice">
                <div className="payment-window-icon">🔄</div>
                <h4>Ventana de pago abierta</h4>
                <p>Completa el pago en la ventana emergente de PayPhone.</p>
              </div>
            )}
            
            {/* Show checking payment message */}
            {checkingPayment && (
              <div className="payment-checking-notice">
                <div className="payment-checking-spinner"></div>
                <p>Verificando tu pago y enviando confirmación...</p>
              </div>
            )}
            
            {/* Terms Checkbox */}
            {!paymentWindowOpen && !checkingPayment && (
              <div className="terms-checkbox-container" style={{ margin: '15px 0', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="checkbox" 
                  id="terms-check-card-sitio" 
                  checked={termsAccepted} 
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="terms-check-card-sitio" style={{ fontSize: '14px', color: '#555', cursor: 'pointer' }}>
                  Acepto los <a href="/politicas-playconsole/" target="_blank" rel="noopener noreferrer" style={{ color: '#600b56', textDecoration: 'underline' }}>Términos y Condiciones</a> y la Política de Privacidad.
                </label>
              </div>
            )}

            {/* Main payment button or confirmation button */}
            {!paymentWindowOpen && !checkingPayment && (
              <button 
                type="button"
                className="btn-payphone"
                onClick={handlePayPhonePayment}
                disabled={!termsAccepted || isSubmitting || !wizardData.tipoCliente || !wizardData.rucCedula || !wizardData.razonSocial || !wizardData.email || !wizardData.telefono || !wizardData.callePrincipal || !wizardData.ciudad || !wizardData.provincia}
              >
                <FaCreditCard style={{ marginRight: '10px' }} />
                {(() => {
                  const basePrice = sitioWebPriceCards.find(c => c.id === selectedSitioWebPlan)?.price || 360;
                  let subtotal = wizardData.tipoPago === 'anticipo' ? Math.round(basePrice / 2) : basePrice;
                  const finalTotal = Math.round(subtotal * 1.05);
                  return isSubmitting ? 'Procesando...' : `Pagar $${formatPrice(finalTotal)} con Tarjeta`;
                })()}
              </button>
            )}

          </div>
        )}

        {wizardData.metodoPago === 'transferencia' && (
          <div className="payment-content transfer-payment">
            <div className="transfer-amount-notice">
              <p>Monto a transferir: <strong>${wizardData.tipoPago === 'anticipo'
                ? Math.round((sitioWebPriceCards.find(c => c.id === selectedSitioWebPlan)?.price || 120) / 2)
                : (sitioWebPriceCards.find(c => c.id === selectedSitioWebPlan)?.price || 120)} USD</strong></p>
            </div>
            <div className="bank-details-card">
              <h4>Datos Bancarios para Transferencia</h4>
              <div className="bank-info-grid">
                <div className="bank-info-item">
                  <span className="label">Banco:</span>
                  <span className="value">Pichincha</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">Nombres:</span>
                  <span className="value">Christopher Alexander Gallardo Campos</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">Cédula:</span>
                  <span className="value">1727155671</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">N° de cuenta:</span>
                  <span className="value">2212385867</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">Tipo de cuenta:</span>
                  <span className="value">Ahorros</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">Celular:</span>
                  <span className="value">0999739534</span>
                </div>
              </div>
              <div className="whatsapp-notice">
                <span>Por favor enviar el comprobante al WhatsApp: <strong>0999739534</strong></span>
              </div>
            </div>

            {/* Subir Comprobante */}
            <div className="form-field upload-field">
              <label>Adjuntar Comprobante de Pago *</label>
              <div className="file-upload-zone">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Validate size (5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        alert('El archivo es demasiado grande. Máximo 5MB.');
                        return;
                      }
                      // Just save file to state, upload happens on submit
                      handleWizardChange('comprobante', file);
                    }
                  }}
                  id="comprobante-upload-sitio"
                />
                <label htmlFor="comprobante-upload-sitio" className="file-upload-label">
                  <FaUpload />
                  <span>{wizardData.comprobante ? 'Comprobante cargado exitosamente' : 'Arrastra o haz clic para subir el comprobante'}</span>
                </label>
              </div>
            </div>

            {/* Terms Checkbox - Transfer */}
            <div className="terms-checkbox-container" style={{ margin: '15px 0', display: 'flex', alignItems: 'center' }}>
              <input 
                type="checkbox" 
                id="terms-check-transfer-sitio" 
                checked={termsAccepted} 
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="terms-check-transfer-sitio" style={{ fontSize: '14px', color: '#555', cursor: 'pointer' }}>
                Acepto los <a href="/politicas-playconsole/" target="_blank" rel="noopener noreferrer" style={{ color: '#600b56', textDecoration: 'underline' }}>Términos y Condiciones</a> y la Política de Privacidad.
              </label>
            </div>

            {/* Botón de confirmar pedido */}
            <button 
              type="button"
              className="btn-confirm-transfer"
              onClick={handleTransferSubmit}
              disabled={!termsAccepted || isSubmitting || !wizardData.tipoCliente || !wizardData.rucCedula || !wizardData.razonSocial || !wizardData.email || !wizardData.telefono || !wizardData.callePrincipal || !wizardData.ciudad || !wizardData.provincia || !wizardData.comprobante}
            >
              <FaCheck style={{ marginRight: '10px' }} />
              {isSubmitting ? 'Enviando pedido...' : 'Confirmar Pedido'}
            </button>
          </div>
        )}
      </div>

      {/* ===== RESUMEN DEL PEDIDO ===== */}
      <div className="order-summary" style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: 'rgba(239, 162, 56, 0.1)', 
        borderRadius: '12px',
        borderLeft: '4px solid #efa238'
      }}>
        <h3 style={{ color: '#efa238', marginBottom: '15px' }}>Resumen del Pedido</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Proyecto:</span>
          <strong>{wizardData.businessName}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Plan:</span>
          <strong>{sitioWebPriceCards.find(c => c.id === selectedSitioWebPlan)?.label}</strong>
        </div>
      </div>
    </div>
  );

  // === RENDER ECOMMERCE PRICE CARDS (TIENDA ONLINE) ===
  const renderEcommercePriceCards = () => (
    <div className={`landing-price-section ${showEcommercePrices ? 'visible' : ''}`}>
      <h2>Elige tu plan de Tienda Online</h2>
      <p className="wizard-subtitle">
        Selecciona el paquete ideal para vender tus productos.
      </p>

      <div className="landing-price-cards three-columns">
        {ecommercePriceCards.map((card) => (
          <div
            key={card.id}
            className={`price-card ${selectedEcommercePlan === card.id ? 'selected' : ''}`}
            onClick={() => {
                setSelectedEcommercePlan(card.id);
                // Also setting budget for analytics
                handleWizardChange('budget', card.price);
            }}
          >
            {/* Plan Name */}
            <h3 className="price-card-name">{card.label}</h3>
            
            {/* Description */}
            <p className="price-card-description">{card.description}</p>
            
            {/* Price */}
            <div className="price-card-price">
              {card.originalPrice && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)" }}>antes</span>
                  <span
                    style={{
                      fontSize: "18px",
                      textDecoration: "line-through",
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    ${card.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 800,
                      letterSpacing: "0.3px",
                      background: "linear-gradient(135deg, #ff4d4d, #f7b733)",
                      color: "#fff",
                      boxShadow: "0 6px 16px rgba(255, 77, 77, 0.35)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    AHORRA {card.discount}%
                  </span>
                </div>
              )}
              ${card.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <ul className="price-card-features">
              {card.features.map((feature, idx) => {
                const key = `store-${card.id}-${idx}`;
                const isOpen = !!openFeatures[key];
                const hasDesc = feature.description !== null;
                return (
                  <li key={idx} className={`feature-accordion-item${hasDesc ? ' has-desc' : ''}`}>
                    <button
                      type="button"
                      className="feature-accordion-trigger"
                      onClick={(e) => { e.stopPropagation(); if (hasDesc) toggleFeature(key); }}
                      style={{ cursor: hasDesc ? 'pointer' : 'default' }}
                    >
                      <span className="feature-check">✓</span>
                      <span className="feature-title">{feature.title}</span>
                      {hasDesc && <span className="feature-arrow">{isOpen ? '▲' : '▼'}</span>}
                    </button>
                    {hasDesc && isOpen && (
                      <p className="feature-accordion-body">{feature.description}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  // === RENDER ECOMMERCE BILLING (TIENDA ONLINE) ===
  const renderEcommerceBilling = () => (
    <div className="wizard-step-content billing-extended">
      <h2>Datos de Facturación</h2>
      <p className="wizard-subtitle">Información para completar tu pedido.</p>
      
      {/* ===== SECCIÓN 1: DATOS DE IDENTIFICACIÓN ===== */}
      <div className="billing-section">
        <h3 className="billing-section-title">Datos de Identificación del Cliente</h3>
        <div className="wizard-form-grid">
          {/* Tipo de Cliente */}
          <div className="form-field full-width">
            <label>Tipo de Cliente *</label>
            <div className="radio-group-horizontal">
              <label className={`radio-option ${wizardData.tipoCliente === 'consumidor_final' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  checked={wizardData.tipoCliente === 'consumidor_final'} 
                  onChange={() => handleWizardChange('tipoCliente', 'consumidor_final')} 
                />
                <span className="radio-label">Consumidor Final (Persona Natural)</span>
              </label>
              <label className={`radio-option ${wizardData.tipoCliente === 'empresa' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  checked={wizardData.tipoCliente === 'empresa'} 
                  onChange={() => handleWizardChange('tipoCliente', 'empresa')} 
                />
                <span className="radio-label">Empresa (Persona Jurídica)</span>
              </label>
            </div>
          </div>

          {/* RUC o Cédula */}
          <div className="form-field">
            <label>{wizardData.tipoCliente === 'empresa' ? 'Identificación Fiscal *' : 'Documento de Identidad *'}</label>
            <input
              type="text"
              value={wizardData.rucCedula || ''}
              onChange={(e) => handleWizardChange('rucCedula', e.target.value)}
              placeholder={wizardData.tipoCliente === 'empresa' ? 'Ej: 1790012345001' : 'Ej: 1712345678'}
              maxLength={wizardData.tipoCliente === 'empresa' ? 13 : 10}
            />
          </div>

          {/* Razón Social / Nombre */}
          <div className="form-field">
            <label>{wizardData.tipoCliente === 'empresa' ? 'Razón Social *' : 'Nombre Completo *'}</label>
            <input
              type="text"
              value={wizardData.razonSocial || ''}
              onChange={(e) => handleWizardChange('razonSocial', e.target.value)}
              placeholder={wizardData.tipoCliente === 'empresa' ? 'Nombre registrado de la empresa' : 'Nombre y apellido completo'}
            />
          </div>

          {/* Correo Electrónico */}
          <div className="form-field">
            <label>Correo Electrónico *</label>
            <input
              type="email"
              value={wizardData.email || ''}
              onChange={(e) => handleWizardChange('email', e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>

          {/* Teléfono */}
          <div className="form-field">
            <label>Teléfono (WhatsApp) *</label>
            <input
              type="tel"
              value={wizardData.telefono || ''}
              onChange={(e) => handleWizardChange('telefono', e.target.value)}
              placeholder="Tu número de teléfono"
            />
          </div>
        </div>
      </div>

      {/* ===== SECCIÓN 2: DIRECCIÓN ===== */}
      <div className="billing-section">
        <h3 className="billing-section-title">Dirección de Facturación</h3>
        <div className="wizard-form-grid">
          {/* Calle Principal */}
          <div className="form-field">
            <label>Calle Principal *</label>
            <input
              type="text"
              value={wizardData.callePrincipal || ''}
              onChange={(e) => handleWizardChange('callePrincipal', e.target.value)}
              placeholder="Ej: Av. Amazonas"
            />
          </div>
          
          {/* Calle Secundaria */}
          <div className="form-field">
            <label>Calle Secundaria</label>
            <input
              type="text"
              value={wizardData.calleSecundaria || ''}
              onChange={(e) => handleWizardChange('calleSecundaria', e.target.value)}
              placeholder="Ej: N32-15"
            />
          </div>

          {/* Ciudad */}
          <div className="form-field">
            <label>Ciudad *</label>
            <input
              type="text"
              value={wizardData.ciudad || ''}
              onChange={(e) => handleWizardChange('ciudad', e.target.value)}
              placeholder="Ej: tu ciudad"
            />
          </div>

          {/* Provincia */}
          <div className="form-field">
            <label>Provincia *</label>
            <select
              value={wizardData.provincia || ''}
              onChange={(e) => handleWizardChange('provincia', e.target.value)}
              className="wizard-select"
            >
              <option value="">Seleccione una provincia...</option>
              <option value="Azuay">Azuay</option>
              <option value="Bolívar">Bolívar</option>
              <option value="Cañar">Cañar</option>
              <option value="Carchi">Carchi</option>
              <option value="Chimborazo">Chimborazo</option>
              <option value="Cotopaxi">Cotopaxi</option>
              <option value="El Oro">El Oro</option>
              <option value="Esmeraldas">Esmeraldas</option>
              <option value="Galápagos">Galápagos</option>
              <option value="Guayas">Guayas</option>
              <option value="Imbabura">Imbabura</option>
              <option value="Loja">Loja</option>
              <option value="Los Ríos">Los Ríos</option>
              <option value="Manabí">Manabí</option>
              <option value="Morona Santiago">Morona Santiago</option>
              <option value="Napo">Napo</option>
              <option value="Orellana">Orellana</option>
              <option value="Pastaza">Pastaza</option>
              <option value="Pichincha">Pichincha</option>
              <option value="Santa Elena">Santa Elena</option>
              <option value="Santo Domingo de los Tsáchilas">Santo Domingo de los Tsáchilas</option>
              <option value="Sucumbíos">Sucumbíos</option>
              <option value="Tungurahua">Tungurahua</option>
              <option value="Zamora Chinchipe">Zamora Chinchipe</option>
            </select>
          </div>

          {/* Código Postal */}
          <div className="form-field">
            <label>Código Postal</label>
            <input
              type="text"
              value={wizardData.codigoPostal || ''}
              onChange={(e) => handleWizardChange('codigoPostal', e.target.value)}
              placeholder="Ej: 170150"
              maxLength={6}
            />
          </div>

          {/* País */}
          <div className="form-field">
            <label>País *</label>
            <input
              type="text"
              value={wizardData.pais || ''}
              onChange={(e) => handleWizardChange('pais', e.target.value)}
              placeholder="Tu país"
            />
          </div>
        </div>
      </div>

      {/* ===== SECCIÓN 4: MÉTODO DE PAGO ===== */}
      <div className="billing-section">
        <h3 className="billing-section-title">Método de Pago</h3>
        
        {/* Selector de tipo de pago (Anticipo / Total) */}
        <div className="payment-type-selector">
          <label className="payment-type-label">Selecciona el tipo de pago:</label>
          <div className="payment-type-buttons">
            <button
              type="button"
              className={`payment-type-btn ${wizardData.tipoPago === 'total' ? 'active' : ''}`}
              onClick={() => handleWizardChange('tipoPago', 'total')}
            >
              <span className="payment-type-name">Pago Total</span>
              <span className="payment-type-amount">
                ${formatPrice(selectedEcommercePlan ? ecommercePriceCards.find(c => c.id === selectedEcommercePlan)?.price || 850 : 850)} USD
              </span>
              <span className="payment-type-badge">100%</span>
            </button>
            <button
              type="button"
              className={`payment-type-btn ${wizardData.tipoPago === 'anticipo' ? 'active' : ''}`}
              onClick={() => handleWizardChange('tipoPago', 'anticipo')}
            >
              <span className="payment-type-name">Anticipo</span>
              <span className="payment-type-amount">
                ${formatPrice(Math.round((selectedEcommercePlan ? ecommercePriceCards.find(c => c.id === selectedEcommercePlan)?.price || 850 : 850) / 2))} USD
              </span>
              <span className="payment-type-badge anticipo">50%</span>
            </button>
          </div>
          {wizardData.tipoPago === 'anticipo' && (
            <p className="anticipo-note">
              * El 50% restante se pagará al momento de la entrega del proyecto.
            </p>
          )}
        </div>
        
        {/* Botones de selección de método */}
        <div className="payment-method-buttons">
          <button
            type="button"
            className={`payment-method-btn ${wizardData.metodoPago === 'tarjeta' ? 'active' : ''}`}
            onClick={() => handleWizardChange('metodoPago', 'tarjeta')}
          >
            <FaCreditCard />
            <span>Tarjeta de Crédito/Débito</span>
          </button>
          <button
            type="button"
            className={`payment-method-btn ${wizardData.metodoPago === 'transferencia' ? 'active' : ''}`}
            onClick={() => handleWizardChange('metodoPago', 'transferencia')}
          >
            <FaExchangeAlt />
            <span>Transferencia Bancaria</span>
          </button>
        </div>

        {/* Contenido según método seleccionado */}
        {wizardData.metodoPago === 'tarjeta' && (
          <div className="payment-content card-payment">
            <div className="payment-info-card">
              <p className="payment-security-note">Pago seguro procesado por PayPhone</p>
              
              {(() => {
                const basePrice = ecommercePriceCards.find(c => c.id === selectedEcommercePlan)?.price || 850;
                let subtotal = wizardData.tipoPago === 'anticipo' ? Math.round(basePrice / 2) : basePrice;
                const canDefer = wizardData.tipoPago !== 'anticipo';
                
                const cardFee = subtotal * 0.05;
                const finalTotal = Math.round(subtotal + cardFee); // Interés de diferido lo suma el Banco
                const monthlyPayment = wizardData.deferredMonths > 0 ? Math.round(finalTotal / wizardData.deferredMonths * 100) / 100 : 0;

                return (
                  <>
                    {canDefer && (
                      <div className="deferral-options-container" style={{ margin: '15px 0', padding: '15px', backgroundColor: 'rgba(239, 162, 56, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 162, 56, 0.2)' }}>
                        <h5 style={{ margin: '0 0 10px 0', color: '#efa238', fontSize: '14px' }}>Opciones de diferido:</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                          {[
                            { value: 0, label: '1 Pago', sub: 'Corriente' },
                            { value: 3, label: '3 Meses', sub: 'Con interés del banco' },
                            { value: 6, label: '6 Meses', sub: 'Con interés del banco' },
                            { value: 12, label: '12 Meses', sub: 'Con interés del banco' }
                          ].map(option => (
                            <div 
                              key={option.value}
                              onClick={() => handleWizardChange('deferredMonths', option.value)}
                              style={{ 
                                padding: '8px', 
                                textAlign: 'center', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                border: wizardData.deferredMonths === option.value ? '1px solid #efa238' : '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: wizardData.deferredMonths === option.value ? 'rgba(239, 162, 56, 0.2)' : 'rgba(255,255,255,0.02)',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{ fontWeight: 'bold', fontSize: '13px', color: wizardData.deferredMonths === option.value ? '#fff' : '#ccc' }}>{option.label}</div>
                              <div style={{ fontSize: '11px', color: wizardData.deferredMonths === option.value ? '#efa238' : '#888' }}>{option.sub}</div>
                            </div>
                          ))}
                        </div>
                        
                        {wizardData.deferredMonths > 0 && (
                          <div style={{ marginTop: '12px', padding: '10px', fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #ff9800', color: '#ddd' }}>
                            <strong>⚠️ Importante:</strong> Para diferir, debes ingresar una <strong>tarjeta de crédito</strong> de los siguientes bancos habilitados:
                            <ul style={{ margin: '8px 0 4px 0', paddingLeft: '18px', lineHeight: '1.6', columns: 2, columnGap: '10px' }}>
                              <li>Produbanco (Visa / MC)</li>
                              <li>Amazonas (Visa)</li>
                              <li>Bolivariano (Visa / MC)</li>
                              <li>Internacional (Visa / MC)</li>
                              <li>Mutualista Azuay (Visa)</li>
                              <li>Mutualista Imbabura (Visa)</li>
                              <li>Machala (Visa / MC)</li>
                              <li>BBP Bank (Visa)</li>
                              <li>Coop. JEP (Visa / MC)</li>
                              <li>Coop. Oscus (Visa / MC)</li>
                              <li>Coop. Pilahuinito (Visa)</li>
                            </ul>
                            <span style={{ fontSize: '11px', color: '#aaa' }}>El cálculo final de cuotas e intereses dependerá de tu banco. Verás el valor exacto en PayPhone.</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="payment-note" style={{ marginBottom: '5px' }}>
                      Subtotal: <strong>${formatPrice(subtotal)} USD</strong>
                    </p>
                    
                    <p className="payment-note" style={{ marginBottom: '5px', fontSize: '0.9em', color: '#ff9800' }}>
                      + 5% Comisión Tarjeta: <strong>${formatPrice(cardFee)} USD</strong>
                    </p>
                    
                    <p className="payment-note" style={{ fontSize: '1.2em' }}>
                      Base a pagar: <strong>${formatPrice(finalTotal)} USD</strong>
                    </p>

                    {wizardData.deferredMonths > 0 && (
                      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '5px', borderLeft: '4px solid #efa238' }}>
                        <p style={{ margin: 0, fontSize: '1.1em' }}>
                          Mensualidad estimada: <strong style={{ color: '#efa238' }}>~ ${formatPrice(monthlyPayment)} / mes</strong> ({wizardData.deferredMonths} cuotas)
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            
            {/* Show payment window open message */}
            {paymentWindowOpen && (
              <div className="payment-window-open-notice">
                <div className="payment-window-icon">🔄</div>
                <h4>Ventana de pago abierta</h4>
                <p>Completa el pago en la ventana emergente de PayPhone.</p>
              </div>
            )}
            
            {/* Show checking payment message */}
            {checkingPayment && (
              <div className="payment-checking-notice">
                <div className="payment-checking-spinner"></div>
                <p>Verificando tu pago y enviando confirmación...</p>
              </div>
            )}
            
            {/* Terms Checkbox */}
            {!paymentWindowOpen && !checkingPayment && (
              <div className="terms-checkbox-container" style={{ margin: '15px 0', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="checkbox" 
                  id="terms-check-card-ecommerce" 
                  checked={termsAccepted} 
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="terms-check-card-ecommerce" style={{ fontSize: '14px', color: '#555', cursor: 'pointer' }}>
                  Acepto los <a href="/politicas-playconsole/" target="_blank" rel="noopener noreferrer" style={{ color: '#600b56', textDecoration: 'underline' }}>Términos y Condiciones</a> y la Política de Privacidad.
                </label>
              </div>
            )}

            {/* Main payment button or confirmation button */}
            {!paymentWindowOpen && !checkingPayment && (
              <button 
                type="button"
                className="btn-payphone"
                onClick={handlePayPhonePayment}
                disabled={!termsAccepted || isSubmitting || !wizardData.tipoCliente || !wizardData.rucCedula || !wizardData.razonSocial || !wizardData.email || !wizardData.telefono || !wizardData.callePrincipal || !wizardData.ciudad || !wizardData.provincia}
              >
                <FaCreditCard style={{ marginRight: '10px' }} />
                {(() => {
                  const basePrice = ecommercePriceCards.find(c => c.id === selectedEcommercePlan)?.price || 850;
                  let subtotal = wizardData.tipoPago === 'anticipo' ? Math.round(basePrice / 2) : basePrice;
                  const finalTotal = Math.round(subtotal * 1.05);
                  return isSubmitting ? 'Procesando...' : `Pagar $${formatPrice(finalTotal)} con Tarjeta`;
                })()}
              </button>
            )}

          </div>
        )}

        {wizardData.metodoPago === 'transferencia' && (
          <div className="payment-content transfer-payment">
            <div className="transfer-amount-notice">
              <p>Monto a transferir: <strong>${wizardData.tipoPago === 'anticipo'
                ? Math.round((ecommercePriceCards.find(c => c.id === selectedEcommercePlan)?.price || 0) / 2)
                : (ecommercePriceCards.find(c => c.id === selectedEcommercePlan)?.price || 0)} USD</strong></p>
            </div>
            <div className="bank-details-card">
              <h4>Datos Bancarios para Transferencia</h4>
              <div className="bank-info-grid">
                <div className="bank-info-item">
                  <span className="label">Banco:</span>
                  <span className="value">Pichincha</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">Nombres:</span>
                  <span className="value">Christopher Alexander Gallardo Campos</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">Cédula:</span>
                  <span className="value">1727155671</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">N° de cuenta:</span>
                  <span className="value">2212385867</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">Tipo de cuenta:</span>
                  <span className="value">Ahorros</span>
                </div>
                <div className="bank-info-item">
                  <span className="label">Celular:</span>
                  <span className="value">0999739534</span>
                </div>
              </div>
              <div className="whatsapp-notice">
                <span>Por favor enviar el comprobante al WhatsApp: <strong>0999739534</strong></span>
              </div>
            </div>

            {/* Subir Comprobante */}
            <div className="form-field upload-field">
              <label>Adjuntar Comprobante de Pago *</label>
              <div className="file-upload-zone">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Validate size (5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        alert('El archivo es demasiado grande. Máximo 5MB.');
                        return;
                      }
                      // Just save file to state, upload happens on submit
                      handleWizardChange('comprobante', file);
                    }
                  }}
                  id="comprobante-upload-ecommerce"
                />
                <label htmlFor="comprobante-upload-ecommerce" className="file-upload-label">
                  <FaUpload />
                  <span>{wizardData.comprobante ? 'Comprobante cargado exitosamente' : 'Arrastra o haz clic para subir el comprobante'}</span>
                </label>
              </div>
            </div>

            {/* Terms Checkbox - Transfer */}
            <div className="terms-checkbox-container" style={{ margin: '15px 0', display: 'flex', alignItems: 'center' }}>
              <input 
                type="checkbox" 
                id="terms-check-transfer-ecommerce" 
                checked={termsAccepted} 
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="terms-check-transfer-ecommerce" style={{ fontSize: '14px', color: '#555', cursor: 'pointer' }}>
                Acepto los <a href="/politicas-playconsole/" target="_blank" rel="noopener noreferrer" style={{ color: '#600b56', textDecoration: 'underline' }}>Términos y Condiciones</a> y la Política de Privacidad.
              </label>
            </div>

            {/* Botón de confirmar pedido */}
            <button 
              type="button"
              className="btn-confirm-transfer"
              onClick={handleTransferSubmit}
              disabled={!termsAccepted || isSubmitting || !wizardData.tipoCliente || !wizardData.rucCedula || !wizardData.razonSocial || !wizardData.email || !wizardData.telefono || !wizardData.callePrincipal || !wizardData.ciudad || !wizardData.provincia || !wizardData.comprobante}
            >
              <FaCheck style={{ marginRight: '10px' }} />
              {isSubmitting ? 'Enviando pedido...' : 'Confirmar Pedido'}
            </button>
          </div>
        )}
      </div>

      {/* ===== RESUMEN DEL PEDIDO ===== */}
      <div className="order-summary" style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: 'rgba(239, 162, 56, 0.1)', 
        borderRadius: '12px',
        borderLeft: '4px solid #efa238'
      }}>
        <h3 style={{ color: '#efa238', marginBottom: '15px' }}>Resumen del Pedido</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Proyecto:</span>
          <strong>{wizardData.businessName}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Plan:</span>
          <strong>{ecommercePriceCards.find(c => c.id === selectedEcommercePlan)?.label}</strong>
        </div>
      </div>
    </div>
  );



  // === RENDER STEPS FOR LANDING PAGE ===

  const renderStep2Landing = () => (
    <div className="wizard-step-content">
      <h2>Identidad del Negocio</h2>
      <p className="wizard-subtitle">Datos esenciales para tu Landing Page.</p>
      
      <div className="wizard-form-grid">
        <div className="wizard-input-group full-width">
          <label>Nombre de tu Campaña, Producto o Marca</label>
          <input 
            type="text" 
            className="wizard-input" 
            placeholder="Ej. Curso de Marketing Digital 2024"
            value={wizardData.businessName}
            onChange={e => handleWizardChange('businessName', e.target.value)}
          />
        </div>

        <div className="wizard-input-group">
          <label>¿A qué sector pertenece?</label>
          <select 
            className="wizard-select"
            value={wizardData.sector}
            onChange={e => handleWizardChange('sector', e.target.value)}
          >
            <option value="">Selecciona...</option>
            <option value="Comercio y Ventas">Comercio y Ventas</option>
            <option value="Salud y Bienestar">Salud y Bienestar</option>
            <option value="Educación / Cursos">Educación / Cursos</option>
            <option value="Servicios Profesionales">Servicios Profesionales</option>
            <option value="Inmobiliaria">Inmobiliaria</option>
            <option value="Consultoría / Coaching">Consultoría / Coaching</option>
            <option value="Fitness / Deportes">Fitness / Deportes</option>
            <option value="Tecnología">Tecnología</option>
            <option value="Otro">Otro</option>
          </select>
          {wizardData.sector === 'Otro' && (
            <input
              type="text"
              placeholder="Especifica tu sector..."
              value={wizardData.sectorOtro || ''}
              onChange={(e) => handleWizardChange('sectorOtro', e.target.value)}
              className="wizard-input mt-2"
              style={{ marginTop: '10px' }}
            />
          )}
        </div>

        <div className="wizard-input-group full-width">
          <label>Situación del Dominio</label>
          <div className="radio-group-vertical">
             <label className={`radio-option ${wizardData.domainStatus === 'tengo' ? 'selected' : ''}`}>
                <input 
                    type="radio" 
                    name="domainStatus" 
                    checked={wizardData.domainStatus === 'tengo'}
                    onChange={() => handleWizardChange('domainStatus', 'tengo')}
                />
                <span className="radio-label">
                    <span className="radio-title">Ya tengo mi dominio</span>
                </span>
             </label>
             <label className={`radio-option ${wizardData.domainStatus === 'necesito' ? 'selected' : ''}`}>
                <input 
                    type="radio" 
                    name="domainStatus" 
                    checked={wizardData.domainStatus === 'necesito'}
                    onChange={() => handleWizardChange('domainStatus', 'necesito')}
                />
                <span className="radio-label">
                    <span className="radio-title">No tengo, necesito uno</span>
                </span>
             </label>
          </div>
          {wizardData.domainStatus === 'necesito' && (
            <input
              type="text"
              placeholder="¿Qué nombre de dominio deseas? Ej: minegocio.com"
              value={wizardData.domainName || ''}
              onChange={(e) => handleWizardChange('domainName', e.target.value)}
              className="wizard-input mt-2"
              style={{ marginTop: '10px' }}
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3Landing = () => (
    <div className="wizard-step-content">
      <h2>Estrategia y Contenido</h2>
      <p className="wizard-subtitle">Define el alcance y complejidad.</p>

      <div className="wizard-form-grid">
         <div className="wizard-input-group full-width">
            <label>¿Cuál es el OBJETIVO PRINCIPAL?</label>
            <div className="radio-group-vertical">
                {[
                    { val: 'leads', label: 'Captar Datos (Leads)' },
                    { val: 'venta', label: 'Venta Directa' },
                    { val: 'whatsapp', label: 'Botón a WhatsApp' },
                    { val: 'webinar', label: 'Registro a Evento/Webinar' }
                ].map(opt => (
                    <label key={opt.val} className={`radio-option ${wizardData.landingObjetivo === opt.val ? 'selected' : ''}`}>
                        <input type="radio" checked={wizardData.landingObjetivo === opt.val} onChange={()=>handleWizardChange('landingObjetivo', opt.val)} />
                        <span className="radio-label">{opt.label}</span>
                    </label>
                ))}
            </div>
         </div>

         <div className="wizard-input-group full-width">
            <label>¿Tienes los textos e imágenes listos?</label>
             <div className="radio-group-vertical">
                {[
                    { val: 'si', label: 'Sí, tengo todo el material' },
                    { val: 'parcial', label: 'Tengo algunas cosas, necesito ayuda' },
                    { val: 'no', label: 'No tengo nada, necesito que lo creen' }
                ].map(opt => (
                    <label key={opt.val} className={`radio-option ${wizardData.landingContenido === opt.val ? 'selected' : ''}`}>
                        <input type="radio" checked={wizardData.landingContenido === opt.val} onChange={()=>handleWizardChange('landingContenido', opt.val)} />
                        <span className="radio-label">{opt.label}</span>
                    </label>
                ))}
            </div>
         </div>

         <div className="wizard-input-group full-width">
            <label>¿Tienes alguna página de referencia? (Opcional)</label>
            <input 
                type="text" 
                className="wizard-input"
                placeholder="https://ejemplo.com"
                value={wizardData.landingReferencia}
                onChange={e => handleWizardChange('landingReferencia', e.target.value)}
            />
         </div>
      </div>
    </div>
  );

  const renderStep4Landing = () => (
      <div className="wizard-step-content">
        <h2>Integraciones Técnicas</h2>
        <p className="wizard-subtitle">¿Dónde conectamos los cables?</p>

        <div className="wizard-form-grid">
            <div className="wizard-input-group full-width">
                <label>¿A dónde deben llegar los datos?</label>
                <div className="radio-group-vertical">
                    {[
                        { val: 'email', label: 'A mi Correo Electrónico' },
                        { val: 'whatsapp', label: 'A mi WhatsApp' },
                        { val: 'sheets', label: 'A Google Sheets' },
                        { val: 'crm', label: 'A un CRM / Email Marketing' }
                    ].map(opt => (
                        <label key={opt.val} className={`radio-option ${wizardData.landingDestinoDatos === opt.val ? 'selected' : ''}`}>
                            <input type="radio" checked={wizardData.landingDestinoDatos === opt.val} onChange={()=>handleWizardChange('landingDestinoDatos', opt.val)} />
                            <span className="radio-label">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="wizard-input-group full-width">
                <label>¿Necesitas códigos de seguimiento?</label>
                <div className="checkbox-group-vertical">
                    {[
                        { val: 'pixel', label: 'Píxel de Facebook / Meta Ads' },
                        { val: 'analytics', label: 'Google Analytics / Tag Manager' },
                        { val: 'none', label: 'No necesito / No sé qué es' }
                    ].map(opt => (
                        <label key={opt.val} className={`checkbox-option ${wizardData.landingTracking.includes(opt.val) ? 'selected' : ''}`}>
                            <input 
                                type="checkbox" 
                                checked={wizardData.landingTracking.includes(opt.val)} 
                                onChange={()=>handleMultiSelect('landingTracking', opt.val)}
                            />
                            <span className="checkbox-label">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
      </div>
  );

  const renderStep5LandingBudget = () => {
    // Custom render for Landing Page budget to avoid conflicts with Sitio Web
    const budgetInfo = getCurrentBudgetInfo();

    return (
        <div className="wizard-step-content plan-section-full">
            <h2>Presupuesto Estimado</h2>
            <p className="wizard-subtitle">Rango: $80 - $200 USD</p>

            <div className="budget-slider-container">
                <div className="budget-amount highlight">${wizardData.budget} USD</div>
                
                 {/* Progress bar visual */}
                <div className="budget-progress-bar">
                    <div 
                        className="budget-progress-fill"
                        style={{ width: `${((wizardData.budget - 80) / (200 - 80)) * 100}%` }}
                    ></div>
                    <input
                        type="range"
                        min="80"
                        max="200"
                        step="10"
                        value={wizardData.budget}
                        onChange={(e) => handleWizardChange('budget', parseInt(e.target.value))}
                        className="budget-slider"
                    />
                </div>

                <div className="budget-labels" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>$80</span>
                    <span>$160</span>
                    <span>$200</span>
                </div>
            </div>

            <div className="budget-info-card mt-4">
                 <h3>{budgetInfo.label}</h3>
                 <p>{budgetInfo.description}</p>
                 <ul className="budget-features">
                    {budgetInfo.features && budgetInfo.features.map((feature, index) => (
                      <li key={index}>
                        <FaCheck className="check-icon" />
                        {feature}
                      </li>
                    ))}
                 </ul>
            </div>

             <div className="payment-method-section mt-4">
                <h3>Método de pago del servicio</h3>
                <div className="payment-buttons">
                  <button
                    className={`btn-payment ${wizardData.paymentMethod === 'tarjeta' ? 'active' : ''}`}
                    onClick={() => handleWizardChange('paymentMethod', 'tarjeta')}
                  >
                    <FaCreditCard />
                    Pagar con Tarjeta
                  </button>
                  <button
                    className={`btn-payment ${wizardData.paymentMethod === 'transferencia' ? 'active' : ''}`}
                    onClick={() => handleWizardChange('paymentMethod', 'transferencia')}
                  >
                    <FaExchangeAlt />
                    Transferencia Bancaria
                  </button>
                </div>
            </div>
        </div>
    );
  };

  // Render Step 2 - Business Details (Sitio Web)
  const renderStep2SitioWeb = () => (
    <div className="wizard-step-content">
      <h2>Detalles del Negocio</h2>
      <p className="wizard-subtitle">
        Proporciona información clave sobre tu empresa para guiar nuestro enfoque.
      </p>

      <div className="wizard-form-grid">
        <div className="wizard-input-group">
          <label>Nombre de tu Negocio o Marca</label>
          <input
            type="text"
            placeholder="Ej: Corporación Acme"
            value={wizardData.businessName}
            onChange={(e) => handleWizardChange('businessName', e.target.value)}
            className="wizard-input"
          />
        </div>

        <div className="wizard-input-group">
          <label>¿A qué sector pertenece tu actividad?</label>
          <select
            value={wizardData.sector}
            onChange={(e) => handleWizardChange('sector', e.target.value)}
            className="wizard-select"
          >
            <option value="">Seleccione un sector...</option>
            {config.sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.label}
              </option>
            ))}
          </select>
          
          {wizardData.sector === 'otros' && (
            <input
              type="text"
              placeholder="Especifica tu sector..."
              value={wizardData.sectorOtro}
              onChange={(e) => handleWizardChange('sectorOtro', e.target.value)}
              className="wizard-input mt-15"
            />
          )}
        </div>

        <div className="wizard-input-group full-width">
          <label>Situación del Dominio</label>
          <div className="wizard-radio-group">
            {config.domainOptions.map((option) => (
              <label key={option.id} className={`wizard-radio-card ${wizardData.domainStatus === option.id ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="domainStatus"
                  value={option.id}
                  checked={wizardData.domainStatus === option.id}
                  onChange={(e) => handleWizardChange('domainStatus', e.target.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          
          {wizardData.domainStatus === 'no_tengo' && (
            <input
              type="text"
              placeholder="¿Qué nombre de dominio deseas? Ej: minegocio.com"
              value={wizardData.domainName}
              onChange={(e) => handleWizardChange('domainName', e.target.value)}
              className="wizard-input mt-15"
            />
          )}
        </div>
      </div>
    </div>
  );

  // Render Step 3 - Budget Slider (SITIO WEB)
  const renderStep3Budget = () => {
    // Force config to be Sitio Web if we are here (just in case), or rely on dynamic config
    // Actually, renderStep3Budget is only called for Sitio Web.
    const budgetInfo = getCurrentBudgetInfo();
    
    return (
      <div className="wizard-step-content">
        <h2>Define tu inversión inicial</h2>
        <p className="wizard-subtitle">
          Ajusta el presupuesto según tus necesidades. Verás qué incluye cada rango.
        </p>

        {!wizardData.isCustomQuote ? (
          <>
            <div className="budget-slider-container">
              <div className="budget-amount highlight">${formatPrice(wizardData.budget)} USD</div>
              
              {/* Progress bar visual */}
              <div className="budget-progress-bar">
                <div 
                  className="budget-progress-fill"
                  style={{ width: `${((wizardData.budget - 360) / (2000 - 360)) * 100}%` }}
                ></div>
                <input
                    type="range"
                    min="360"
                    max="2000"
                    step="10"
                    value={wizardData.budget}
                    onChange={(e) => handleWizardChange('budget', parseInt(e.target.value))}
                    className="budget-slider"
                />
              </div>

              <div className="budget-labels" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>$360</span>
                <span>$2000+</span>
              </div>
            </div>

            <div className="budget-info-card">
              <h3>{budgetInfo.label}</h3>
              <p>{budgetInfo.description}</p>
              <ul className="budget-features">
                {budgetInfo.features.map((feature, index) => (
                  <li key={index}>
                    <FaCheck className="check-icon" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="custom-quote-card">
            <h3>{config.customQuote.label}</h3>
            <p>{config.customQuote.description}</p>
            <div className="custom-budget-input">
              <label>Monto presupuestado (USD)</label>
              <input
                type="number"
                placeholder="Ej: 500"
                value={wizardData.customBudget}
                onChange={(e) => handleWizardChange('customBudget', e.target.value)}
                className="wizard-input"
                min="301"
              />
            </div>
          </div>
        )}

        <label className="wizard-checkbox">
          <input
            type="checkbox"
            checked={wizardData.isCustomQuote}
            onChange={(e) => handleWizardChange('isCustomQuote', e.target.checked)}
          />
          <span>Mi proyecto requiere más de $300 (Cotización personalizada)</span>
        </label>

        <div className="payment-method-section">
          <h3>Método de pago</h3>
          <div className="payment-buttons">
            <button
              className={`btn-payment ${wizardData.paymentMethod === 'tarjeta' ? 'active' : ''}`}
              onClick={() => handleWizardChange('paymentMethod', 'tarjeta')}
            >
              <FaCreditCard />
              Pagar con Tarjeta
            </button>
            <button
              className={`btn-payment ${wizardData.paymentMethod === 'transferencia' ? 'active' : ''}`}
              onClick={() => handleWizardChange('paymentMethod', 'transferencia')}
            >
              <FaExchangeAlt />
              Transferencia Bancaria
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Step 4 - Billing
  const renderStep4Billing = () => (
    <div className="wizard-step-content">
      <h2>Facturación y Pago</h2>
      <p className="wizard-subtitle">
        Completa tus datos para generar la factura y procesar el pago.
      </p>

      <div className="wizard-form-grid">
        <div className="wizard-input-group">
          <label>Identificación Fiscal / Documento</label>
          <input
            type="text"
            placeholder="Ingresa 10 o 13 dígitos"
            value={wizardData.rucCedula}
            onChange={(e) => handleWizardChange('rucCedula', e.target.value)}
            className="wizard-input"
            maxLength={13}
          />
        </div>

        <div className="wizard-input-group">
          <label>Razón Social / Nombre Completo</label>
          <input
            type="text"
            placeholder="Nombre o empresa"
            value={wizardData.razonSocial}
            onChange={(e) => handleWizardChange('razonSocial', e.target.value)}
            className="wizard-input"
          />
        </div>

        <div className="wizard-input-group full-width">
          <label>Dirección</label>
          <input
            type="text"
            placeholder="Dirección de facturación"
            value={wizardData.direccion}
            onChange={(e) => handleWizardChange('direccion', e.target.value)}
            className="wizard-input"
          />
        </div>

        <div className="wizard-input-group">
          <label>Correo Electrónico</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={wizardData.email}
            onChange={(e) => handleWizardChange('email', e.target.value)}
            className="wizard-input"
          />
        </div>

        <div className="wizard-input-group">
          <label>Teléfono (WhatsApp)</label>
          <input
            type="tel"
            placeholder="Tu número de teléfono"
            value={wizardData.telefono}
            onChange={(e) => handleWizardChange('telefono', e.target.value)}
            className="wizard-input"
          />
        </div>
      </div>

      {/* Card Payment Fields - Separate from grid for full width */}
      {wizardData.paymentMethod === 'tarjeta' && (
        <div className="card-payment-section">
          <h4>Datos de la Tarjeta</h4>
          <p className="payment-security-note">🔒 Pago seguro procesado por PayPhone</p>
          
          <div className="card-fields-grid">
            <div className="wizard-input-group full-width">
              <label>Número de Tarjeta</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={wizardData.cardNumber}
                onChange={(e) => handleWizardChange('cardNumber', e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                className="wizard-input"
                maxLength={19}
              />
            </div>
            
            <div className="wizard-input-group full-width">
              <label>Nombre en la Tarjeta</label>
              <input
                type="text"
                placeholder="Como aparece en la tarjeta"
                value={wizardData.cardName}
                onChange={(e) => handleWizardChange('cardName', e.target.value.toUpperCase())}
                className="wizard-input"
              />
            </div>
            
            <div className="wizard-input-group">
              <label>Fecha de Expiración</label>
              <input
                type="text"
                placeholder="MM/AA"
                value={wizardData.cardExpiry}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length >= 2) val = val.slice(0,2) + '/' + val.slice(2,4);
                  handleWizardChange('cardExpiry', val);
                }}
                className="wizard-input"
                maxLength={5}
              />
            </div>
            
            <div className="wizard-input-group">
              <label>CVV</label>
              <input
                type="password"
                placeholder="***"
                value={wizardData.cardCvv}
                onChange={(e) => handleWizardChange('cardCvv', e.target.value.replace(/\D/g, ''))}
                className="wizard-input"
                maxLength={4}
              />
            </div>
          </div>
          
          {/* PayPhone button container - will be replaced by PayPhone SDK */}
          <div id="payphone-button-container" className="payphone-container"></div>
        </div>
      )}

      {/* Bank Transfer Section - Separate from grid for full width */}
      {wizardData.paymentMethod === 'transferencia' && (
        <div className="transfer-payment-section">
          <div className="bank-details-card">
            <h4>Datos Bancarios</h4>
            <ul>
              <li><strong>Banco:</strong> Banco Pichincha</li>
              <li><strong>Tipo:</strong> Cuenta de Ahorros</li>
              <li><strong>Número:</strong> 2209876543</li>
              <li><strong>Nombre:</strong> UNDERCODEEC</li>
              <li><strong>Identificación Fiscal:</strong> 1712345678001</li>
            </ul>
          </div>

          <div className="wizard-input-group">
            <label>Adjuntar Comprobante de Pago</label>
            <div className="file-upload-zone">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                id="comprobante-upload"
              />
              <label htmlFor="comprobante-upload" className="file-upload-label">
                <FaUpload />
                <span>{wizardData.comprobante ? wizardData.comprobante.name : 'Arrastra o haz clic para subir'}</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ========== SOFTWARE DEVELOPMENT WIZARD STEPS ==========
  
  // Render Step 2 Software - El Problema (Alcance Funcional)
  const renderStep2Software = () => (
    <div className="wizard-step-content">
      <h2>El Problema (Alcance Funcional)</h2>
      <p className="wizard-subtitle">
        Ayúdanos a entender qué quieres resolver y el estado actual de tu proyecto.
      </p>

      <div className="wizard-form-grid">
        <div className="wizard-input-group full-width">
          <label>¿Cuál es el objetivo principal del software?</label>
          <div className="wizard-radio-group-vertical">
            {configSoftware.objetivos.map((opt) => (
              <label key={opt.id} className={`wizard-radio-card-full ${wizardData.softwareObjetivo === opt.id ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="softwareObjetivo"
                  value={opt.id}
                  checked={wizardData.softwareObjetivo === opt.id}
                  onChange={(e) => handleWizardChange('softwareObjetivo', e.target.value)}
                />
                <div className="radio-card-content">
                  <span className="radio-label">{opt.label}</span>
                  <span className="radio-desc">{opt.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="wizard-input-group full-width">
          <label>Describe brevemente el problema que quieres solucionar:</label>
          <textarea
            placeholder="Ejemplo: Actualmente llevamos el control de pedidos en Excel y perdemos mucha información..."
            value={wizardData.softwareProblema}
            onChange={(e) => handleWizardChange('softwareProblema', e.target.value)}
            className="wizard-textarea"
            rows={4}
          />
        </div>

        <div className="wizard-input-group full-width">
          <label>¿En qué estado se encuentra el proyecto?</label>
          <div className="wizard-radio-group-vertical">
            {configSoftware.estadoProyecto.map((opt) => (
              <label key={opt.id} className={`wizard-radio-card-full ${wizardData.softwareEstado === opt.id ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="softwareEstado"
                  value={opt.id}
                  checked={wizardData.softwareEstado === opt.id}
                  onChange={(e) => handleWizardChange('softwareEstado', e.target.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Step 3 Software - Complejidad Técnica
  const renderStep3Software = () => (
    <div className="wizard-step-content">
      <h2>Complejidad Técnica</h2>
      <p className="wizard-subtitle">
        Esta información nos ayuda a estimar el alcance y recursos necesarios.
      </p>

      <div className="wizard-form-grid">
        <div className="wizard-input-group full-width">
          <label>¿Cuántas personas usarán el sistema aproximadamente?</label>
          <div className="wizard-radio-group-vertical">
            {configSoftware.escalaUsuarios.map((opt) => (
              <label key={opt.id} className={`wizard-radio-card-full ${wizardData.softwareEscala === opt.id ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="softwareEscala"
                  value={opt.id}
                  checked={wizardData.softwareEscala === opt.id}
                  onChange={(e) => handleWizardChange('softwareEscala', e.target.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="wizard-input-group full-width">
          <label>¿Qué roles de usuario necesitas? (Selección múltiple)</label>
          <div className="wizard-checkbox-group">
            {configSoftware.rolesUsuario.map((opt) => (
              <label key={opt.id} className={`wizard-checkbox-card ${wizardData.softwareRoles.includes(opt.id) ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={wizardData.softwareRoles.includes(opt.id)}
                  onChange={() => handleMultiSelect('softwareRoles', opt.id)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="wizard-input-group full-width">
          <label>¿Necesitas integraciones externas? (Selección múltiple)</label>
          <div className="wizard-checkbox-group">
            {configSoftware.integraciones.map((opt) => (
              <label key={opt.id} className={`wizard-checkbox-card ${wizardData.softwareIntegraciones.includes(opt.id) ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={wizardData.softwareIntegraciones.includes(opt.id)}
                  onChange={() => handleMultiSelect('softwareIntegraciones', opt.id)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Step 4 Software - Presupuesto, Tiempo y Cierre
  const renderStep4Software = () => (
    <div className="wizard-step-content">
      <h2>Presupuesto y Tiempos</h2>
      <p className="wizard-subtitle">
        Esto nos ayuda a alinear expectativas desde el inicio.
      </p>

      <div className="wizard-form-grid">
        <div className="wizard-input-group full-width">
          <label>Rango de Presupuesto Estimado:</label>
          <div className="wizard-radio-group-vertical">
            {configSoftware.presupuestos.map((opt) => (
              <label key={opt.id} className={`wizard-radio-card-full ${wizardData.softwarePresupuesto === opt.id ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="softwarePresupuesto"
                  value={opt.id}
                  checked={wizardData.softwarePresupuesto === opt.id}
                  onChange={(e) => handleWizardChange('softwarePresupuesto', e.target.value)}
                />
                <div className="radio-card-content">
                  <span className="radio-label">{opt.label}</span>
                  {opt.desc && <span className="radio-desc">{opt.desc}</span>}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="wizard-input-group full-width">
          <label>¿Para cuándo esperas tenerlo funcionando?</label>
          <div className="wizard-radio-group-vertical">
            {configSoftware.tiempos.map((opt) => (
              <label key={opt.id} className={`wizard-radio-card-full ${wizardData.softwareTiempo === opt.id ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="softwareTiempo"
                  value={opt.id}
                  checked={wizardData.softwareTiempo === opt.id}
                  onChange={(e) => handleWizardChange('softwareTiempo', e.target.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="wizard-input-group">
          <label>Tu Nombre</label>
          <input
            type="text"
            placeholder="Nombre completo"
            value={wizardData.softwareNombre}
            onChange={(e) => handleWizardChange('softwareNombre', e.target.value)}
            className="wizard-input"
          />
        </div>

        <div className="wizard-input-group">
          <label>Correo Electrónico</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={wizardData.softwareEmail}
            onChange={(e) => handleWizardChange('softwareEmail', e.target.value)}
            className="wizard-input"
          />
        </div>

        <div className="wizard-input-group full-width">
          <label>Teléfono (WhatsApp)</label>
          <input
            type="tel"
            placeholder="Tu número de teléfono"
            value={wizardData.softwareTelefono}
            onChange={(e) => handleWizardChange('softwareTelefono', e.target.value)}
            className="wizard-input"
          />
        </div>



        {/* Success message after form completion indicator */}
        <div className="software-closing-message full-width">
          <p>{configSoftware.mensajeCierre}</p>
        </div>
      </div>
    </div>
  );





  // === RENDER STEPS FOR WEB APP ===

  // Paso 2: Identidad
  const renderStep2AppWeb = () => (
    <div className="wizard-step-content">
      <h2>Identidad del Negocio</h2>
      <p className="wizard-subtitle">Para empezar, cuéntanos quién eres.</p>
      
      <div className="wizard-form-grid">
        <div className="wizard-input-group full-width">
          <label>Nombre de tu Proyecto o Empresa</label>
          <input 
            type="text" 
            className="wizard-input" 
            placeholder="Ej. Sistema de Inventarios X"
            value={wizardData.businessName}
            onChange={e => handleWizardChange('businessName', e.target.value)}
          />
        </div>

        <div className="wizard-input-group">
          <label>¿A qué sector pertenece?</label>
          <select 
            className="wizard-select"
            value={wizardData.sector}
            onChange={e => handleWizardChange('sector', e.target.value)}
          >
             <option value="">Selecciona un sector</option>
             {wizardConfig.sitioWeb.sectors.map(opt => (
                <option key={opt.id} value={opt.label}>{opt.label}</option>
             ))}
          </select>
        </div>

        <div className="wizard-input-group full-width">
          <label>¿Tienes dominio para tu aplicación?</label>
          <div className="radio-group-vertical">
             <label className={`radio-option ${wizardData.domainStatus === 'tengo' ? 'selected' : ''}`}>
                <input type="radio" checked={wizardData.domainStatus === 'tengo'} onChange={() => handleWizardChange('domainStatus', 'tengo')} />
                <span className="radio-label">Sí, ya tengo (Ej: app.miempresa.com)</span>
             </label>
             <label className={`radio-option ${wizardData.domainStatus === 'necesito' ? 'selected' : ''}`}>
                <input type="radio" checked={wizardData.domainStatus === 'necesito'} onChange={() => handleWizardChange('domainStatus', 'necesito')} />
                <span className="radio-label">No, necesito asesoría</span>
             </label>
             <label className={`radio-option ${wizardData.domainStatus === 'interno' ? 'selected' : ''}`}>
                <input type="radio" checked={wizardData.domainStatus === 'interno'} onChange={() => handleWizardChange('domainStatus', 'interno')} />
                <span className="radio-label">Es para uso interno (Intranet)</span>
             </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Paso 3: Tipo de Solución
  const renderStep3AppWeb = () => (
    <div className="wizard-step-content">
      <h2>Tipo de Solución</h2>
      <p className="wizard-subtitle">Define el enfoque de tu aplicación.</p>

      <div className="wizard-form-grid">
         <div className="wizard-input-group full-width">
            <label>¿Cuál es el propósito principal?</label>
            <div className="radio-group-vertical">
                {[
                    { val: 'interno', label: 'Uso Interno (Herramienta de Gestión)' },
                    { val: 'saas', label: 'Producto Comercial (SaaS)' },
                    { val: 'clientes', label: 'Portal de Clientes' },
                    { val: 'otros', label: 'Otro (Especificar)' }
                ].map(opt => (
                    <label key={opt.val} className={`radio-option ${wizardData.appWebObjetivo === opt.val ? 'selected' : ''}`}>
                        <input type="radio" checked={wizardData.appWebObjetivo === opt.val} onChange={()=>handleWizardChange('appWebObjetivo', opt.val)} />
                        <span className="radio-label">{opt.label}</span>
                    </label>
                ))}
            </div>
            {wizardData.appWebObjetivo === 'otros' && (
                <input 
                    type="text" 
                    className="wizard-input mt-2" 
                    placeholder="Especifique el propósito..."
                    value={wizardData.appWebObjetivoDetalle}
                    onChange={e => handleWizardChange('appWebObjetivoDetalle', e.target.value)}
                />
            )}
         </div>

         <div className="wizard-input-group full-width">
            <label>¿Necesitas que funcione en celulares?</label>
            <div className="radio-group-vertical">
                {[
                    { val: 'responsive', label: 'Sí, Responsive (Adaptable)' },
                    { val: 'pwa', label: 'Sí, PWA (Tipo App Móvil)' },
                    { val: 'desktop', label: 'No es prioridad (Uso en PC)' }
                ].map(opt => (
                    <label key={opt.val} className={`radio-option ${wizardData.appWebMobile === opt.val ? 'selected' : ''}`}>
                        <input type="radio" checked={wizardData.appWebMobile === opt.val} onChange={()=>handleWizardChange('appWebMobile', opt.val)} />
                        <span className="radio-label">{opt.label}</span>
                    </label>
                ))}
            </div>
         </div>

         <div className="wizard-input-group full-width">
             <label>Describe brevemente qué hará la aplicación</label>
             <textarea 
                className="wizard-textarea"
                placeholder="Ej: Quiero un sistema donde mis vendedores registren visitas..."
                value={wizardData.appWebDescripcion}
                onChange={e => handleWizardChange('appWebDescripcion', e.target.value)}
             ></textarea>
         </div>
      </div>
    </div>
  );

  // Paso 4: Usuarios y Datos
  const renderStep4AppWeb = () => (
      <div className="wizard-step-content">
        <h2>Usuarios y Seguridad</h2>
        <p className="wizard-subtitle">Dimensionamiento del sistema.</p>

        <div className="wizard-form-grid">
            <div className="wizard-input-group full-width">
                <label>¿Cuántos usuarios estimas?</label>
                <div className="radio-group-vertical">
                    {[
                        { val: 'pequeno', label: 'Pequeño: 1 - 50 usuarios' },
                        { val: 'mediano', label: 'Mediano: 50 - 500 usuarios' },
                        { val: 'masivo', label: 'Masivo: +500 usuarios' }
                    ].map(opt => (
                        <label key={opt.val} className={`radio-option ${wizardData.appWebUsuarios === opt.val ? 'selected' : ''}`}>
                            <input type="radio" checked={wizardData.appWebUsuarios === opt.val} onChange={()=>handleWizardChange('appWebUsuarios', opt.val)} />
                            <span className="radio-label">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="wizard-input-group full-width">
                <label>¿Qué roles de seguridad necesitas?</label>
                <div className="checkbox-group-vertical">
                    {[
                        { val: 'admin', label: 'Super Administrador (Ve todo)' },
                        { val: 'editores', label: 'Editores / Empleados (Carga de datos)' },
                        { val: 'lectores', label: 'Lectores / Clientes (Solo lectura)' },
                        { val: 'auditores', label: 'Auditores' },
                        { val: 'otros', label: 'Otros (Especificar)' }
                    ].map(opt => (
                        <label key={opt.val} className={`checkbox-option ${wizardData.appWebRoles.includes(opt.val) ? 'selected' : ''}`}>
                            <input 
                                type="checkbox" 
                                checked={wizardData.appWebRoles.includes(opt.val)} 
                                onChange={()=>handleMultiSelect('appWebRoles', opt.val)}
                            />
                            <span className="checkbox-label">{opt.label}</span>
                        </label>
                    ))}
                </div>
                {wizardData.appWebRoles.includes('otros') && (
                    <input 
                        type="text" 
                        className="wizard-input mt-2" 
                        placeholder="Especifique los roles..."
                        value={wizardData.appWebRolesDetalle}
                        onChange={e => handleWizardChange('appWebRolesDetalle', e.target.value)}
                    />
                )}
            </div>

            <div className="wizard-input-group full-width">
                <label>¿Requiere reportes o gráficos?</label>
                <div className="radio-group-vertical">
                    {[
                        { val: 'dashboards', label: 'Sí, Dashboards en tiempo real' },
                        { val: 'export', label: 'Solo exportar a Excel/PDF' },
                        { val: 'none', label: 'No necesito reportes complejos' }
                    ].map(opt => (
                        <label key={opt.val} className={`radio-option ${wizardData.appWebReportes === opt.val ? 'selected' : ''}`}>
                            <input type="radio" checked={wizardData.appWebReportes === opt.val} onChange={()=>handleWizardChange('appWebReportes', opt.val)} />
                            <span className="radio-label">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
      </div>
  );

  // Paso 5: Final CTA (Diagnóstico)
  const renderStep5AppWebFinal = () => {
    return (
      <div className="wizard-step-content" style={{textAlign: 'center'}}>
         <div className="software-closing-message" style={{background: 'transparent', border: 'none'}}>
            <div style={{marginBottom: '30px'}}>
                <div className="project-card-icon" style={{width: '80px', height: '80px', background: 'rgba(239, 162, 56, 0.1)', borderRadius: '50%', margin: '0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                     <FaCheck style={{color: '#efa238', fontSize: '40px'}} />
                </div>
                <h2>Proyecto Configurado</h2>
            </div>
            
            <p style={{fontSize: '16px', color: '#ccc', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px'}}>
               Hemos recibido tus requerimientos para tu Aplicación Web Cloud. Déjanos tus datos para enviarte una propuesta preliminar y agendar una sesión técnica si es necesario.
            </p>

            <div className="wizard-form-grid mt-4 mb-4" style={{textAlign: 'left'}}>
                <div className="wizard-input-group">
                    <label>Tu Nombre *</label>
                    <input 
                        type="text" 
                        className="wizard-input" 
                        placeholder="Ej. Juan Pérez"
                        value={wizardData.softwareNombre} 
                        onChange={e=>handleWizardChange('softwareNombre',e.target.value)} 
                    />
                </div>
                <div className="wizard-input-group">
                    <label>Teléfono / WhatsApp</label>
                    <input 
                        type="tel" 
                        className="wizard-input" 
                        placeholder="Tu número de teléfono"
                        value={wizardData.softwareTelefono} 
                        onChange={e=>handleWizardChange('softwareTelefono',e.target.value)} 
                    />
                </div>
                <div className="wizard-input-group full-width">
                    <label>Email Corporativo *</label>
                    <input 
                        type="email" 
                        className="wizard-input" 
                        placeholder="juan@empresa.com"
                        value={wizardData.softwareEmail} 
                        onChange={e=>handleWizardChange('softwareEmail',e.target.value)} 
                    />
                </div>
            </div>

            {/* Button removed - using global wizard button */}
         </div>
      </div>
    );
  };

  // === RENDER STEPS FOR MOBILE APP ===
  
  // Paso 2: Identidad (Reutiliza lógica visual similar a App Web pero con título Mobile)
  const renderStep2AppMobile = () => (
      <div className="wizard-step-content">
        <h2>Identidad de la App</h2>
        <p className="wizard-subtitle">Datos preliminares para tu aplicación móvil.</p>

        <div className="wizard-form-grid">
            <div className="wizard-input-group full-width">
            <label>Nombre de la App</label>
            <input 
                type="text" 
                className="wizard-input" 
                placeholder="Ej. Mi Tienda App"
                value={wizardData.businessName}
                onChange={e => handleWizardChange('businessName', e.target.value)}
            />
            </div>

            <div className="wizard-input-group">
            <label>Sector / Categoría</label>
            <select 
                className="wizard-select"
                value={wizardData.sector}
                onChange={e => handleWizardChange('sector', e.target.value)}
            >
                <option value="">Selecciona una categoría</option>
                {wizardConfig.sitioWeb.sectors.map(opt => (
                    <option key={opt.id} value={opt.label}>{opt.label}</option>
                ))}
            </select>
            </div>

            <div className="wizard-input-group full-width">
            <label>¿Tienes sitio web actualmente?</label>
            <div className="radio-group-vertical">
                <label className={`radio-option ${wizardData.domainStatus === 'tengo' ? 'selected' : ''}`}>
                    <input type="radio" checked={wizardData.domainStatus === 'tengo'} onChange={() => handleWizardChange('domainStatus', 'tengo')} />
                    <span className="radio-label">Sí, quiero convertirlo en App</span>
                </label>
                <label className={`radio-option ${wizardData.domainStatus === 'necesito' ? 'selected' : ''}`}>
                    <input type="radio" checked={wizardData.domainStatus === 'necesito'} onChange={() => handleWizardChange('domainStatus', 'necesito')} />
                    <span className="radio-label">No, es un proyecto nuevo</span>
                </label>
            </div>
            </div>
        </div>
      </div>
  );

  // Paso 3: Plataforma y Tecnología
  // Paso 3: Plataforma y Tecnología
  const renderStep3AppMobile = () => (
      <div className="wizard-step-content">
          <h2>Plataforma y Tecnología</h2>
          <p className="wizard-subtitle">Objetivo: Definir si desarrollas una o dos apps.</p>

          <div className="wizard-form-grid">
              <div className="wizard-input-group full-width">
                  <label>1. ¿En qué dispositivos debe funcionar?</label>
                  <div className="radio-group-vertical">
                      {[
                          { val: 'android', label: 'Solo Android (Más económico y con mayor cuota de mercado)' },
                          { val: 'ios', label: 'Solo iPhone (iOS)' },
                          { val: 'ambos', label: 'En ambos (Android + iOS) (Requiere desarrollo Híbrido o doble esfuerzo)' }
                      ].map(opt => (
                          <label key={opt.val} className={`radio-option ${wizardData.appMobilePlataforma === opt.val ? 'selected' : ''}`}>
                              <input type="radio" checked={wizardData.appMobilePlataforma === opt.val} onChange={()=>handleWizardChange('appMobilePlataforma', opt.val)} />
                              <span className="radio-label">{opt.label}</span>
                          </label>
                      ))}
                  </div>
              </div>

              <div className="wizard-input-group full-width">
                  <label>2. ¿Qué tipo de App es?</label>
                  <div className="radio-group-vertical">
                      {[
                          { val: 'gestion', label: 'App de Gestión/Interna (Para mis empleados/vendedores)' },
                          { val: 'clientes', label: 'App para Clientes/Público (Tienda, Delivery, Red Social)' },
                          { val: 'informativa', label: 'App Informativa (Catálogo, Noticias)' }
                      ].map(opt => (
                          <label key={opt.val} className={`radio-option ${wizardData.appMobileTipo === opt.val ? 'selected' : ''}`}>
                              <input type="radio" checked={wizardData.appMobileTipo === opt.val} onChange={()=>handleWizardChange('appMobileTipo', opt.val)} />
                              <span className="radio-label">{opt.label}</span>
                          </label>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );

  // Paso 4: Funcionalidades Críticas
  const renderStep4AppMobile = () => (
      <div className="wizard-step-content">
          <h2>Funcionalidades Críticas</h2>
          <p className="wizard-subtitle">Objetivo: Detectar funciones nativas costosas.</p>

          <div className="wizard-form-grid">
              <div className="wizard-input-group full-width">
                  <label>1. ¿Necesitas funciones nativas del celular?</label>
                  <div className="checkbox-group-vertical">
                      {[
                          { val: 'gps', label: 'Geolocalización / Mapas (GPS) (Ej: Rastreo de pedidos)' },
                          { val: 'camara', label: 'Cámara / Escáner QR' },
                          { val: 'push', label: 'Notificaciones Push (Alertas al celular)' },
                          { val: 'offline', label: 'Funcionamiento Offline (Sin internet)' },
                          { val: 'none', label: 'Ninguna, solo mostrar información' }
                      ].map(opt => (
                          <label key={opt.val} className={`checkbox-option ${wizardData.appMobileFuncionalidades.includes(opt.val) ? 'selected' : ''}`}>
                              <input 
                                  type="checkbox" 
                                  checked={wizardData.appMobileFuncionalidades.includes(opt.val)} 
                                  onChange={()=>handleMultiSelect('appMobileFuncionalidades', opt.val)}
                              />
                              <span className="checkbox-label">{opt.label}</span>
                          </label>
                      ))}
                  </div>
              </div>

              <div className="wizard-input-group full-width">
                  <label>2. Publicación en Tiendas:</label>
                  <div className="radio-group-vertical">
                      {[
                          { val: 'ayuda', label: 'Necesito ayuda para subirla a Play Store y App Store.' },
                          { val: 'tengo_cuentas', label: 'Ya tengo mis cuentas de desarrollador, solo necesito el archivo (APK/IPA).' }
                      ].map(opt => (
                          <label key={opt.val} className={`radio-option ${wizardData.appMobilePublicacion === opt.val ? 'selected' : ''}`}>
                              <input type="radio" checked={wizardData.appMobilePublicacion === opt.val} onChange={()=>handleWizardChange('appMobilePublicacion', opt.val)} />
                              <span className="radio-label">{opt.label}</span>
                          </label>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );

  // Paso 5: Final Mobile (Meeting Only)
  const renderStep5AppMobileFinal = () => {
    return (
      <div className="wizard-step-content" style={{textAlign: 'center'}}>
          <div className="software-closing-message" style={{background: 'transparent', border: 'none'}}>
            <div style={{marginBottom: '30px'}}>
                <div className="project-card-icon" style={{width: '80px', height: '80px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', margin: '0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                     {icons.mobileApp}
                </div>
                <h2>Proyecto Configurado</h2>
            </div>
            
            <p style={{fontSize: '16px', color: '#ccc', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px'}}>
               Hemos recibido tus requerimientos para tu App Móvil. Déjanos tus datos para enviarte una propuesta preliminar y agendar una sesión técnica si es necesario.
            </p>

            <div className="wizard-form-grid mt-4 mb-4" style={{textAlign: 'left'}}>
                <div className="wizard-input-group">
                    <label>Tu Nombre *</label>
                    <input 
                        type="text" 
                        className="wizard-input" 
                        placeholder="Ej. Juan Pérez"
                        value={wizardData.softwareNombre} 
                        onChange={e=>handleWizardChange('softwareNombre',e.target.value)} 
                    />
                </div>
                <div className="wizard-input-group">
                    <label>Teléfono / WhatsApp</label>
                    <input 
                        type="tel" 
                        className="wizard-input" 
                        placeholder="Tu número de teléfono"
                        value={wizardData.softwareTelefono} 
                        onChange={e=>handleWizardChange('softwareTelefono',e.target.value)} 
                    />
                </div>
                <div className="wizard-input-group full-width">
                    <label>Email Corporativo *</label>
                    <input 
                        type="email" 
                        className="wizard-input" 
                        placeholder="juan@empresa.com"
                        value={wizardData.softwareEmail} 
                        onChange={e=>handleWizardChange('softwareEmail',e.target.value)} 
                    />
                </div>
            </div>

            {/* Button removed - using global wizard button */}
         </div>
      </div>
    );
  };


  // === RENDER STEPS FOR MOODLE ===

  // Paso 2: Identidad (Reutiliza renderStep2AppWeb o renderStep2SitioWeb, usamos renderStep2AppWeb por consistencia)
  // Actually, let's create a specific one just in case we want to customize the title
  const renderStep2Moodle = () => (
      <div className="wizard-step-content">
        <h2>Identidad Institucional</h2>
        <p className="wizard-subtitle">Datos de la institución o empresa educativa.</p>
        
        <div className="wizard-form-grid">
            <div className="wizard-input-group full-width">
            <label>Nombre de la Institución / Empresa</label>
            <input 
                type="text" 
                className="wizard-input" 
                placeholder="Ej. Academia de Idiomas X"
                value={wizardData.businessName}
                onChange={e => handleWizardChange('businessName', e.target.value)}
            />
            </div>

            <div className="wizard-input-group">
            <label>Sector Educativo</label>
            <select 
                className="wizard-select"
                value={wizardData.sector}
                onChange={e => handleWizardChange('sector', e.target.value)}
            >
                <option value="">Selecciona...</option>
                <option value="Colegio">Colegio / Escuela</option>
                <option value="Universidad">Universidad / Instituto</option>
                <option value="Empresa">Empresa (Capacitación)</option>
                <option value="Academia">Academia Online</option>
                <option value="Otro">Otro</option>
            </select>
            </div>

            <div className="wizard-input-group full-width">
            <label>Dominio / URL</label>
            <div className="radio-group-vertical">
                <label className={`radio-option ${wizardData.domainStatus === 'tengo' ? 'selected' : ''}`}>
                    <input type="radio" checked={wizardData.domainStatus === 'tengo'} onChange={() => handleWizardChange('domainStatus', 'tengo')} />
                    <span className="radio-label">Ya tengo dominio (ej. miacademia.com)</span>
                </label>
                <label className={`radio-option ${wizardData.domainStatus === 'necesito' ? 'selected' : ''}`}>
                    <input type="radio" checked={wizardData.domainStatus === 'necesito'} onChange={() => handleWizardChange('domainStatus', 'necesito')} />
                    <span className="radio-label">No tengo, necesito uno</span>
                </label>
            </div>
            </div>
        </div>
      </div>
  );

  // Paso 3: Escala y Usuarios
  const renderStep3Moodle = () => (
      <div className="wizard-step-content">
          <h2>Escala y Usuarios</h2>
          <p className="wizard-subtitle">Objetivo: Calcular el tamaño del VPS/Hosting.</p>

          <div className="wizard-form-grid">
              <div className="wizard-input-group full-width">
                    <label>1. ¿Cuál es el uso principal?</label>
                    <div className="radio-group-vertical">
                        {[
                            { val: 'colegio', label: 'Colegio / Universidad (Educación formal, notas, periodos)' },
                            { val: 'capacitacion', label: 'Capacitación Corporativa (Cursos para empleados)' },
                            { val: 'venta', label: 'Venta de Cursos (Academia online con pagos)' }
                        ].map(opt => (
                            <label key={opt.val} className={`radio-option ${wizardData.moodleUso === opt.val ? 'selected' : ''}`}>
                                <input type="radio" checked={wizardData.moodleUso === opt.val} onChange={()=>handleWizardChange('moodleUso', opt.val)} />
                                <span className="radio-label">{opt.label}</span>
                            </label>
                        ))}
                    </div>
              </div>

              <div className="wizard-input-group full-width">
                    <label>2. ¿Cuántos estudiantes estimas tener activos AL MISMO TIEMPO?</label>
                    <p className="wizard-subtitle" style={{fontSize: '0.9em', marginTop: '-5px', marginBottom: '10px'}}>Esta es la pregunta más importante para que no se caiga el servidor.</p>
                    <div className="radio-group-vertical">
                        {[
                            { val: 'bajo', label: 'Bajo: Menos de 50 usuarios simultáneos.' },
                            { val: 'medio', label: 'Medio: 50 - 200 usuarios.' },
                            { val: 'alto', label: 'Alto: Más de 200 (Requiere servidor dedicado).' }
                        ].map(opt => (
                            <label key={opt.val} className={`radio-option ${wizardData.moodleUsuarios === opt.val ? 'selected' : ''}`}>
                                <input type="radio" checked={wizardData.moodleUsuarios === opt.val} onChange={()=>handleWizardChange('moodleUsuarios', opt.val)} />
                                <span className="radio-label">{opt.label}</span>
                            </label>
                        ))}
                    </div>
              </div>
          </div>
      </div>
  );

  // Paso 4: Contenido y Diseño
  const renderStep4Moodle = () => (
      <div className="wizard-step-content">
          <h2>Contenido y Diseño</h2>
          <p className="wizard-subtitle">Objetivo: Definir horas de configuración.</p>

          <div className="wizard-form-grid">
              <div className="wizard-input-group full-width">
                  <label>1. ¿Cómo serán las clases?</label>
                  <div className="radio-group-vertical">
                      {[
                          { val: 'asincronicas', label: 'Asincrónicas: Solo subiré videos grabados, PDFs y tareas.' },
                          { val: 'en_vivo', label: 'En Vivo: Necesito integración con Zoom / Teams / Meet.' }
                      ].map(opt => (
                          <label key={opt.val} className={`radio-option ${wizardData.moodleClases === opt.val ? 'selected' : ''}`}>
                              <input type="radio" checked={wizardData.moodleClases === opt.val} onChange={()=>handleWizardChange('moodleClases', opt.val)} />
                              <span className="radio-label">{opt.label}</span>
                          </label>
                      ))}
                  </div>
              </div>

              <div className="wizard-input-group full-width">
                  <label>2. Diseño del Aula Virtual:</label>
                  <div className="radio-group-vertical">
                      {[
                          { val: 'estandar', label: 'Tema Estándar: Usar una plantilla limpia con mi logo. (Económico)' },
                          { val: 'a_medida', label: 'Diseño A Medida: Personalización avanzada de la interfaz. (Costoso)' }
                      ].map(opt => (
                          <label key={opt.val} className={`radio-option ${wizardData.moodleDiseno === opt.val ? 'selected' : ''}`}>
                              <input type="radio" checked={wizardData.moodleDiseno === opt.val} onChange={()=>handleWizardChange('moodleDiseno', opt.val)} />
                              <span className="radio-label">{opt.label}</span>
                          </label>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );

  // Paso 5: Final Moodle logic
  const renderStep5Moodle = () => {
       // Logic Decision
       // Camino A: < 50 alumnos AND Estandar AND Asincronicas -> Price slider $300-$500
       // Camino B: > 50 alumnos OR A Medida OR En Vivo -> Quote

       const isPathB = wizardData.moodleUsuarios !== 'bajo' || wizardData.moodleDiseno === 'a_medida' || wizardData.moodleClases === 'en_vivo';
       
       if (isPathB) {
           // Camino B: Quote / Meeting
           return (
              <div className="wizard-step-content" style={{textAlign: 'center'}}>
                 <div className="software-closing-message" style={{background: 'transparent', border: 'none'}}>
                    <div style={{marginBottom: '30px'}}>
                        <div className="project-card-icon" style={{width: '80px', height: '80px', background: 'rgba(239, 162, 56, 0.1)', borderRadius: '50%', margin: '0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            {icons.moodle}
                        </div>
                        <h2>Proyecto Institucional</h2>
                    </div>
                    
                    <p style={{fontSize: '16px', color: '#ccc', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px'}}>
                        Para garantizar la estabilidad de tu aula con esa cantidad de alumnos y personalización, necesitamos dimensionar tu servidor. Te contactaremos con una propuesta técnica.
                    </p>

                    <div className="wizard-form-grid mt-4 mb-4">
                        <div className="wizard-input-group">
                        <label>Tu Nombre</label>
                        <input type="text" className="wizard-input" value={wizardData.softwareNombre} onChange={e=>handleWizardChange('softwareNombre',e.target.value)} />
                        </div>
                        <div className="wizard-input-group">
                        <label>Teléfono</label>
                        <input type="tel" className="wizard-input" value={wizardData.softwareTelefono} onChange={e=>handleWizardChange('softwareTelefono',e.target.value)} />
                        </div>
                        <div className="wizard-input-group full-width">
                        <label>Email</label>
                        <input type="email" className="wizard-input" value={wizardData.softwareEmail} onChange={e=>handleWizardChange('softwareEmail',e.target.value)} />
                        </div>
                    </div>

                    {/* Button removed - using global wizard button */}
                 </div>
              </div>
           );
       } else {
           // Camino A: Basic Installation ($300 - $500)
           // Default budget range for standard moodle
           const minBudget = 300;
           const maxBudget = 500;
           
           // Ensure budget is within range if not already
           if (wizardData.budget < minBudget || wizardData.budget > maxBudget) {
               // We should probably set this in useEffect but doing it here for display is ok
               // Ideally we should have a useEffect to set default budget based on path
           }
           
           return (
            <div className="wizard-step-content plan-section-full">
                <h2>Paquete "Instalación Básica"</h2>
                <p className="wizard-subtitle">Tu configuración encaja en nuestro plan estándar.</p>
    
                <div className="budget-slider-container">
                    <div className="budget-amount highlight">${wizardData.budget} USD</div>
                    
                    {/* Progress bar visual */}
                    <div className="budget-progress-bar">
                        <div 
                            className="budget-progress-fill"
                            style={{ width: `${((wizardData.budget - minBudget) / (maxBudget - minBudget)) * 100}%` }}
                        ></div>
                        <input
                            type="range"
                            min={minBudget}
                            max={maxBudget}
                            step="25"
                            value={wizardData.budget}
                            onChange={(e) => handleWizardChange('budget', parseInt(e.target.value))}
                            className="budget-slider"
                        />
                    </div>
    
                    <div className="budget-labels" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>${minBudget}</span>
                        <span>${maxBudget}</span>
                    </div>

                    <div className="budget-info-card mt-4">
                        <h3>Incluye:</h3>
                        <ul className="budget-features">
                            <li>Instalación de Moodle última versión</li>
                            <li>Configuración de Servidor VPS Básico</li>
                            <li>Tema Gráfico Estándar (Logo + Colores)</li>
                            <li>Capacitación de uso (Videos)</li>
                            <li>Soporte por 30 días</li>
                        </ul>
                    </div>
                </div>
    
                 <div className="payment-method-section mt-4">
                    <h3>Método de pago</h3>
                    <div className="payment-buttons">
                      <button
                        className={`btn-payment ${wizardData.paymentMethod === 'tarjeta' ? 'active' : ''}`}
                        onClick={() => handleWizardChange('paymentMethod', 'tarjeta')}
                      >
                        <FaCreditCard />
                        Pagar con Tarjeta
                      </button>
                      <button
                        className={`btn-payment ${wizardData.paymentMethod === 'transferencia' ? 'active' : ''}`}
                        onClick={() => handleWizardChange('paymentMethod', 'transferencia')}
                      >
                        <FaExchangeAlt />
                        Transferencia Bancaria
                      </button>
                    </div>
                </div>
            </div>
        );
       }
  };


  // Render current step content
  const renderStepContent = () => {
    // Landing Page Flow - Price cards first
    if (selectedPlan === 'Landing Page') {
        // Show confirmation page after successful submission
        if (showConfirmation) {
          return (
            <div className="wizard-step-content confirmation-page">
              <div className="confirmation-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '80px', height: '80px', stroke: '#efa238', fill: 'none', strokeWidth: 2 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 12l2 2 4-4"/>
                </svg>
              </div>
              <h2>¡Pedido Recibido!</h2>
              <p className="wizard-subtitle">
                Hemos creado tu carpeta de proyecto en Google Drive.
              </p>
              
              <div className="confirmation-details">
                <div className="confirmation-item">
                  <span className="label">Proyecto:</span>
                  <span className="value">{wizardData.businessName}</span>
                </div>
                <div className="confirmation-item">
                  <span className="label">Plan:</span>
                  <span className="value">{landingPriceCards.find(c => c.id === selectedLandingPlan)?.label}</span>
                </div>
                <div className="confirmation-item">
                  <span className="label">Precio:</span>
                  <span className="value">${formatPrice(landingPriceCards.find(c => c.id === selectedLandingPlan)?.price || 80)} USD</span>
                </div>
              </div>
              
              <div className="confirmation-message">
                <div className="email-notice">
                  <FaCheck style={{ color: '#efa238', marginRight: '10px' }} />
                  <span>Revisa tu correo <strong>{wizardData.email}</strong> - Te enviamos el enlace a tu carpeta</span>
                </div>
                <p style={{ marginTop: '20px', color: 'rgba(255,255,255,0.7)' }}>
                  En tu carpeta podrás subir logos, imágenes y contenido para tu Landing Page.
                  Un asesor te contactará pronto para iniciar tu proyecto.
                </p>
              </div>
              
              <button 
                className="btn-next-step"
                onClick={() => {
                  setShowConfirmation(false);
                  setCurrentStep(1);
                  setSelectedPlan('');
                  setSelectedLandingPlan('');
                }}
                style={{ marginTop: '30px' }}
              >
                Finalizar
              </button>
            </div>
          );
        }
        
        switch (currentStep) {
            case 1: 
              return renderStep1();
            case 2:
              // Step 2: Price Cards
              return (
                <div className="wizard-step-content">
                  {renderLandingPriceCards()}
                </div>
              );
            case 3: return renderStep2Landing(); // Identity
            case 4: return renderLandingBilling(); // Special billing for Landing Page
            default: return renderStep1();
        }
    }

    // Sitio Web Flow - Price cards
    if (selectedPlan === 'Sitio Web') {
        // Show confirmation page after successful submission
        if (showConfirmation) {
          return (
            <div className="wizard-step-content confirmation-page">
              <div className="confirmation-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '80px', height: '80px', stroke: '#efa238', fill: 'none', strokeWidth: 2 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 12l2 2 4-4"/>
                </svg>
              </div>
              <h2>¡Pedido Recibido!</h2>
              <p className="wizard-subtitle">
                Hemos creado tu carpeta de proyecto en Google Drive.
              </p>
              
              <div className="confirmation-details">
                <div className="confirmation-item">
                  <span className="label">Proyecto:</span>
                  <span className="value">{wizardData.businessName}</span>
                </div>
                <div className="confirmation-item">
                  <span className="label">Plan:</span>
                  <span className="value">{sitioWebPriceCards.find(c => c.id === selectedSitioWebPlan)?.label}</span>
                </div>
                <div className="confirmation-item">
                  <span className="label">Precio:</span>
                  <span className="value">${formatPrice(sitioWebPriceCards.find(c => c.id === selectedSitioWebPlan)?.price || 360)} USD</span>
                </div>
              </div>
              
              <div className="confirmation-message">
                <div className="email-notice">
                  <FaCheck style={{ color: '#efa238', marginRight: '10px' }} />
                  <span>Revisa tu correo <strong>{wizardData.email}</strong> - Te enviamos el enlace a tu carpeta</span>
                </div>
                <p style={{ marginTop: '20px', color: 'rgba(255,255,255,0.7)' }}>
                  En tu carpeta podrás subir logos, imágenes y contenido para tu Sitio Web.
                  Un asesor te contactará pronto para iniciar tu proyecto.
                </p>
              </div>
              
              <button 
                className="btn-next-step"
                onClick={() => {
                  setShowConfirmation(false);
                  setCurrentStep(1);
                  setSelectedPlan('');
                  setSelectedSitioWebPlan('');
                }}
                style={{ marginTop: '30px' }}
              >
                Finalizar
              </button>
            </div>
          );
        }
        
        switch (currentStep) {
            case 1: 
              return renderStep1();
            case 2:
              // Step 2: Price Cards
              return (
                <div className="wizard-step-content">
                  {renderSitioWebPriceCards()}
                </div>
              );
            case 3: return renderStep2SitioWeb(); // Identity
            case 4: return renderSitioWebBilling(); // Billing for Sitio Web
            default: return renderStep1();
        }
    }
    
    if (currentStep === 1) {
      return renderStep1();
    }
    
    // Software Development Flow
    if (selectedPlan === 'Desarrollo de Software') {
      switch (currentStep) {
        case 2: return renderStep2Software();
        case 3: return renderStep3Software();
        case 4: return renderStep4Software();
        default: return renderStep1();
      }
    }

    // Tienda Online Flow
    // Tienda Online Flow
    if (selectedPlan === 'Tienda Online') {
        switch (currentStep) {
          case 2: return (
            <div className="wizard-step-content">
              {renderEcommercePriceCards()}
            </div>
          );
          case 3: return renderStep2SitioWeb(); // Reuse Identity
          case 4: return renderEcommerceBilling();
          default: return renderStep1();
        }
    }

    // Aplicación Web Flow
    if (selectedPlan === 'Aplicación Web') {
        switch (currentStep) {
            case 2: return renderStep2AppWeb();
            case 3: return renderStep3AppWeb();
            case 4: return renderStep4AppWeb();
            case 5: return renderStep5AppWebFinal();
            default: return renderStep1();
        }
    }

    // Aplicación Móvil Flow
    if (selectedPlan === 'Aplicación Móvil') {
        switch (currentStep) {
            case 2: return renderStep2AppMobile();
            case 3: return renderStep3AppMobile();
            case 4: return renderStep4AppMobile();
            case 5: return renderStep5AppMobileFinal();
            default: return renderStep1();
        }
    }

    // Plataforma Moodle Flow
    if (selectedPlan === 'Plataforma de cursos Moodle') {
        switch (currentStep) {
            case 2: return renderStep2Moodle();
            case 3: return renderStep3Moodle();
            case 4: return renderStep4Moodle();
            case 5: return renderStep5Moodle();
            default: return renderStep1();
        }
    }
    
    // For other project types - show generic contact form
    return (
      <div className="wizard-step-content">
        <h2>Cuéntanos sobre tu proyecto</h2>
        <p className="wizard-subtitle">
          Este tipo de proyecto requiere una cotización personalizada. Déjanos tus datos y nos pondremos en contacto contigo.
        </p>
        <div className="wizard-form-grid">
          <div className="wizard-input-group">
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={wizardData.razonSocial}
              onChange={(e) => handleWizardChange('razonSocial', e.target.value)}
              className="wizard-input"
            />
          </div>
          <div className="wizard-input-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={wizardData.email}
              onChange={(e) => handleWizardChange('email', e.target.value)}
              className="wizard-input"
            />
          </div>
          <div className="wizard-input-group">
            <label>Teléfono (WhatsApp)</label>
            <input
              type="tel"
              placeholder="Tu número de teléfono"
              value={wizardData.telefono}
              onChange={(e) => handleWizardChange('telefono', e.target.value)}
              className="wizard-input"
            />
          </div>
          <div className="wizard-input-group full-width">
            <label>Describe tu proyecto</label>
            <textarea
              placeholder="Cuéntanos sobre lo que necesitas..."
              value={wizardData.businessName}
              onChange={(e) => handleWizardChange('businessName', e.target.value)}
              className="wizard-textarea"
              rows={4}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="planes" className="wizard-section">
      <div className="container">
        <div className="section-head text-center mb-60 animate-fadeUp">
          <h6 className="sub-head">
            <span className="fz-12">PLAN DE PRECIOS</span>
          </h6>
          <h2>Elija el plan adecuado para usted.</h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ff4757',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '700',
              padding: '7px 18px',
              borderRadius: '30px',
              letterSpacing: '0.02em',
              boxShadow: '0 4px 14px rgba(255,71,87,0.35)',
            }}>
              🎉 Descuentos especiales de hasta 68% en nuestros planes web
            </span>
          </div>
        </div>
        <div className={`plans-two-columns ${showLandingPrices || showSitioWebPrices || showEcommercePrices ? 'expanded-wizard' : ''}`}>
          {/* COLUMNA IZQUIERDA - Agendar Reunión */}
          <div className="schedule-column animate-fadeRight" style={{ transitionDelay: '150ms' }}>
            <div className="schedule-card hover-lift">
              <h2>Únase a Undercodeec</h2>
              <p>Programa una visita guiada rápida de 15 minutos y uno de nuestros asesores te atenderá.</p>
              <img src="/landing-preview/img/img-call.png" alt="Visita Guiada" className="schedule-img" />
              <button
                className="btn-schedule"
                onClick={() => {
                  ReactGA.event({
                    category: 'Interacción',
                    action: 'click_reserva_llamada',
                    label: 'Botón Reserva una llamada introductoria',
                  });
                  if (typeof window !== 'undefined' && window.fbq) {
                    window.fbq('trackCustom', 'ClickReservaLlamada', {
                      source: 'AffiliationSection',
                    });
                  }
                }}
              >
                <a href="#reserva_agenda" className="button-reservation">
                  Reserva una llamada introductoria de 15 minutos
                </a>
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA - Wizard de Formulario */}
          <div className="wizard-column animate-fadeLeft" style={{ transitionDelay: '300ms' }}>
            <div className="wizard-content">
              {showSuccessAlert ? (
                <div className="wizard-success">
                  <div className="success-icon">
                    <FaCheck />
                  </div>
                  <h2>¡Solicitud Enviada!</h2>
                  <p>Hemos recibido tu información. Nos pondremos en contacto contigo muy pronto.</p>
                </div>
              ) : (
                <>
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={`${selectedPlan}-${currentStep}`}
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      style={{ width: '100%', overflow: 'hidden' }}
                    >
                      {renderStepContent()}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="wizard-nav">
                    {currentStep > 1 && (
                      <button className="btn-back" onClick={handlePrevStep}>
                        <FaArrowLeft />
                      </button>
                    )}
                    
                    {currentStep < (['Aplicación Web', 'Aplicación Móvil', 'Plataforma de cursos Moodle'].includes(selectedPlan) ? 5 : (['Sitio Web', 'Desarrollo de Software', 'Tienda Online', 'Landing Page'].includes(selectedPlan) ? 4 : 2)) ? (
                      <button 
                        className="btn-next-step" 
                        onClick={handleNextStep}
                        disabled={!isStepValid()}
                      >
                        Siguiente paso
                        <FaArrowRight />
                      </button>
                    ) : (
                      !['Sitio Web', 'Tienda Online', 'Landing Page'].includes(selectedPlan) && (
                        <button 
                          className="btn-submit-wizard" 
                          onClick={handleSubmit}
                          disabled={loading || !isStepValid()}
                        >
                          {loading ? 'Procesando...' : 'FINALIZAR PROYECTO 🚀'}
                        </button>
                      )
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar with Steps */}
            {!showSuccessAlert && (
              <div className="wizard-sidebar-inline">
                <ul className="step-list">
                  {getSteps().map((step) => (
                    <li
                      key={step.number}
                      className={`step-item ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
                    >
                      <div className="step-number">
                        {currentStep > step.number ? <FaCheck /> : step.number}
                      </div>
                      <div className="step-content">
                        <h5>{step.title}</h5>
                        <p>{step.subtitle}</p>
                        
                        {/* Custom Image for Project Step - Position controllable via style */}
                        {step.number === 1 && currentStep === 1 && (
                            <div className="sidebar-custom-image-container active slide-in-bottom" style={{ position: 'relative', marginTop: '10px' }}>
                                <img 
                                    src="/landing-preview/img/Proyecto.webp" 
                                    alt="Tipo de Proyecto" 
                                    style={{ 
                                        width: '100%', 
                                        maxWidth: '200px',
                                        // User can adjust these values for custom positioning
                                        position: 'relative', 
                                        top: '0px', 
                                        left: '0px'
                                    }} 
                                />
                            </div>
                        )}
                        
                        {/* Custom Image for Plan Step - Position controllable via style */}
                        {(step.title === 'Elige tu plan') && currentStep === step.number && (
                            <div className="sidebar-custom-image-container active slide-in-bottom" style={{ position: 'relative', marginTop: '10px' }}>
                                <img 
                                    src="/landing-preview/img/Plan.webp" 
                                    alt="Elige tu plan" 
                                    style={{ 
                                        width: '100%', 
                                        maxWidth: '200px',
                                        // User can adjust these values for custom positioning
                                        position: 'relative', 
                                        top: '0px', 
                                        left: '0px'
                                    }} 
                                />
                            </div>
                        )}

                        {/* Custom Image for Identity Step - Position controllable via style */}
                        {(step.title === 'Identidad' || step.title === 'Información del negocio' || step.title === 'El problema') && currentStep === step.number && (
                            <div className="sidebar-custom-image-container active slide-in-bottom" style={{ position: 'relative', marginTop: '10px' }}>
                                <img 
                                    src="/landing-preview/img/Identidad.webp" 
                                    alt="Identidad" 
                                    style={{ 
                                        width: '100%', 
                                        maxWidth: '200px',
                                        // User can adjust these values for custom positioning
                                        position: 'relative', 
                                        top: '0px', 
                                        left: '0px'
                                    }} 
                                />
                            </div>
                        )}
                        {/* Custom Image for Billing Step - Position controllable via style */}
                        {(step.title === 'Facturación' || step.title === 'Datos de contacto') && currentStep === step.number && (
                            <div className="sidebar-custom-image-container active slide-in-bottom" style={{ position: 'relative', marginTop: '10px' }}>
                                <img 
                                    src="/landing-preview/img/card_credit.webp" 
                                    alt="Payment Methods" 
                                    className="sidebar-payment-img"
                                    style={{ 
                                        width: '100%', 
                                        maxWidth: '200px',
                                        // User can adjust these values for custom positioning
                                        position: 'relative', 
                                        top: '0px', 
                                        left: '0px'
                                    }} 
                                />
                            </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AffiliationSection;
