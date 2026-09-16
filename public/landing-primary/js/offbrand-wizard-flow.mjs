const PRICE_CARDS = {
  "Sitio Web": [
    {
      id: "web-launch",
      label: "Plan de Lanzamiento",
      price: 360,
      description: "Presencia Viable - Tu negocio abierto al mundo",
      features: [
        "Diseño profesional con hasta 5 páginas",
        "Adaptado para celulares, tablets y computadoras",
        "Dominio .com y hosting incluido por 1 año",
        "Certificado de seguridad SSL",
        "Hasta 5 cuentas de correo corporativo",
        "Formulario de contacto y botón de WhatsApp",
        "Configuración inicial en Google",
        "1 mes de soporte técnico incluido",
      ],
    },
    {
      id: "web-growth",
      label: "Plan de Crecimiento",
      price: 510,
      description: "Máquina de Leads - Web estratégica y CRO",
      features: [
        "Todo lo del Plan Lanzamiento",
        "Hasta 8 páginas con estructura para vender más",
        "Textos persuasivos que generan confianza",
        "Optimización de velocidad de carga",
        "Posicionamiento local en Google",
        "Google Analytics y Search Console conectados",
        "Integración con tus herramientas",
        "3 meses de soporte técnico incluido",
      ],
    },
    {
      id: "web-authority",
      label: "Plan de Autoridad",
      price: 1010,
      description: "Ecosistema Corporativo - Rendimiento extremo",
      features: [
        "Todo lo del Plan Crecimiento",
        "Diseño 100% personalizado, sin plantillas",
        "Automatización con Inteligencia Artificial",
        "Sistemas avanzados a medida",
        "Seguridad reforzada",
        "Campaña en Google Ads activa durante 1 mes",
        "Seguimiento de resultados de la campaña",
        "Soporte VIP prioritario por 6 meses",
      ],
    },
  ],
  "Landing Page": [
    {
      id: "landing-basic",
      label: "Landing Básica",
      price: 250,
      description: "Captación de leads",
      features: [
        "Landing page de una sola sección",
        "Diseño responsive para celulares",
        "Botón flotante de WhatsApp y llamada directa",
        "Formulario de contacto o captura de prospectos",
        "Sección de beneficios del servicio o producto",
        "Dominio .com y hosting básico por 1 año",
        "5 correos corporativos",
        "SEO técnico base",
        "1 mes de soporte posterior a la entrega",
      ],
    },
    {
      id: "landing-pro",
      label: "Landing Pro",
      price: 600,
      description: "Marketing integrado",
      features: [
        "Todo lo de la Landing Básica",
        "Textos persuasivos para tu oferta",
        "Formulario optimizado para captar prospectos",
        "Recurso promocional o incentivo de conversión",
        "Seguimiento de campañas y anuncios con Google Analytics",
        "Integración con WhatsApp y respuestas iniciales",
      ],
    },
    {
      id: "landing-premium",
      label: "Landing Premium",
      price: 1500,
      description: "Embudo automatizado",
      features: [
        "Todo lo de la Landing Básica",
        "Palabras clave optimizadas para Google",
        "Campaña en Google Ads activa durante 1 mes",
        "Diseño personalizado con animaciones inmersivas",
      ],
    },
  ],
  "Tienda Online": [
    {
      id: "store-launch",
      label: "Tienda de Lanzamiento",
      price: 550,
      description: "Para iniciar ventas online",
      features: [
        "Catálogo de productos administrable",
        "Carga inicial de hasta 20 productos",
        "Carrito de compras y proceso de pago seguro",
        "Dominio .com, hosting y SSL por 1 año",
        "Diseño adaptado para todos los dispositivos",
        "Configuración de envíos",
        "Configuración inicial en Google",
        "5 correos corporativos",
        "Capacitación para gestionar tu tienda",
        "1 mes de soporte técnico incluido",
      ],
    },
    {
      id: "store-growth",
      label: "Tienda de Crecimiento",
      price: 850,
      description: "Para escalar ventas",
      features: [
        "Todo lo de la Tienda de Lanzamiento",
        "Filtros de búsqueda avanzados",
        "SEO técnico avanzado",
        "Recuperación de carritos abandonados",
        "Control de inventario en tiempo real",
        "Estrategia de envíos por zonas y condiciones",
        "3 meses de soporte técnico incluido",
      ],
    },
    {
      id: "store-elite",
      label: "Tienda Élite",
      price: 3490,
      description: "Arquitectura de alto rendimiento",
      features: [
        "Todo lo de la Tienda de Crecimiento",
        "Tecnología ultra rápida",
        "Conexión con tus sistemas empresariales",
        "Recomendador inteligente con IA",
        "Ventas internacionales",
        "Automatización de marketing",
        "Facturación electrónica integrada",
        "Seguridad reforzada y respaldos automáticos",
        "Soporte VIP prioritario por 6 meses",
      ],
    },
  ],
};

export const BILLING_COUNTRIES = [
  ["EC", "Ecuador", "+593"], ["ES", "España", "+34"], ["US", "Estados Unidos", "+1"],
  ["CA", "Canadá", "+1"], ["AR", "Argentina", "+54"], ["BO", "Bolivia", "+591"],
  ["BR", "Brasil", "+55"], ["CL", "Chile", "+56"], ["CO", "Colombia", "+57"],
  ["CR", "Costa Rica", "+506"], ["DO", "República Dominicana", "+1"], ["GT", "Guatemala", "+502"],
  ["MX", "México", "+52"], ["PA", "Panamá", "+507"], ["PE", "Perú", "+51"],
  ["PR", "Puerto Rico", "+1"], ["PY", "Paraguay", "+595"], ["UY", "Uruguay", "+598"],
  ["VE", "Venezuela", "+58"], ["DE", "Alemania", "+49"], ["FR", "Francia", "+33"],
  ["GB", "Reino Unido", "+44"], ["IT", "Italia", "+39"], ["PT", "Portugal", "+351"],
];

const TIME_ZONE_COUNTRIES = {
  "America/Argentina/Buenos_Aires": "AR", "America/Asuncion": "PY", "America/Bogota": "CO",
  "America/Guayaquil": "EC", "America/La_Paz": "BO", "America/Lima": "PE",
  "America/Mexico_City": "MX", "America/Montevideo": "UY", "America/Panama": "PA",
  "America/Santiago": "CL", "Europe/Madrid": "ES", "Europe/Lisbon": "PT",
};

const BUSINESS_FIELDS = ["businessName", "sector", "domainStatus"];
const BILLING_FIELDS = ["tipoCliente", "rucCedula", "razonSocial", "email", "telefonoPais", "telefono", "pais", "callePrincipal", "ciudad", "provincia", "metodoPago", "termsAccepted"];

const PROJECT_ROUTES = {
  "Sitio Web": [
    { id: "price", title: "Elige el alcance", required: ["selectedPrice"] },
    { id: "business", title: "Sobre tu negocio", required: BUSINESS_FIELDS },
    { id: "billing", title: "Facturación y pago", required: BILLING_FIELDS },
  ],
  "Landing Page": [
    { id: "price", title: "Elige el alcance", required: ["selectedPrice"] },
    { id: "business", title: "Sobre tu campaña", required: BUSINESS_FIELDS },
    { id: "billing", title: "Facturación y pago", required: BILLING_FIELDS },
  ],
  "Tienda Online": [
    { id: "price", title: "Elige el alcance", required: ["selectedPrice"] },
    { id: "business", title: "Sobre tu tienda", required: BUSINESS_FIELDS },
    { id: "billing", title: "Facturación y pago", required: BILLING_FIELDS },
  ],
  "Desarrollo de Software": [
    { id: "discovery", title: "El problema", required: ["softwareObjetivo", "softwareProblema", "softwareEstado"] },
    { id: "scope", title: "Alcance técnico", required: ["softwareEscala", "softwareRoles"] },
    { id: "contact", title: "Presupuesto y contacto", required: ["softwarePresupuesto", "softwareTiempo", "softwareNombre", "softwareEmail"] },
    { id: "submit", title: "Enviar solicitud", required: [] },
  ],
  "Aplicación Web": [
    { id: "business", title: "Identidad del Negocio", required: BUSINESS_FIELDS },
    { id: "solution", title: "Tipo de Solución", required: ["appWebObjetivo", "appWebMobile", "appWebDescripcion"] },
    { id: "users", title: "Usuarios y Seguridad", required: ["appWebUsuarios", "appWebRoles", "appWebReportes"] },
    { id: "contact", title: "Proyecto Configurado", required: ["softwareNombre", "softwareEmail"] },
    { id: "submit", title: "Enviar solicitud", required: [] },
  ],
  "Aplicación Móvil": [
    { id: "business", title: "Identidad de la App", required: BUSINESS_FIELDS },
    { id: "platform", title: "Plataforma y Tecnología", required: ["appMobilePlataforma", "appMobileTipo"] },
    { id: "features", title: "Funcionalidades Críticas", required: ["appMobileFuncionalidades", "appMobilePublicacion"] },
    { id: "contact", title: "Proyecto Configurado", required: ["softwareNombre", "softwareEmail"] },
    { id: "submit", title: "Enviar solicitud", required: [] },
  ],
  "Plataforma de cursos Moodle": [
    { id: "business", title: "Identidad Institucional", required: BUSINESS_FIELDS },
    { id: "scale", title: "Escala y Usuarios", required: ["moodleUso", "moodleUsuarios"] },
    { id: "content", title: "Contenido y Diseño", required: ["moodleClases", "moodleDiseno"] },
    { id: "contact", title: "Datos de contacto", required: ["softwareNombre", "softwareEmail"] },
  ],
};

const DEFAULT_STATE = {
  selectedPrice: "", businessName: "", sector: "", domainStatus: "", domainName: "",
  tipoCliente: "", rucCedula: "", razonSocial: "", email: "", telefonoPais: "", telefono: "",
  callePrincipal: "", calleSecundaria: "", ciudad: "", provincia: "", codigoPostal: "", pais: "",
  metodoPago: "", tipoPago: "total", termsAccepted: false, comprobante: null,
  softwareObjetivo: "", softwareProblema: "", softwareEstado: "", softwareEscala: "", softwareRoles: [], softwareIntegraciones: [], softwarePresupuesto: "", softwareTiempo: "", softwareNombre: "", softwareEmail: "", softwareTelefono: "",
  appWebObjetivo: "", appWebObjetivoDetalle: "", appWebMobile: "", appWebDescripcion: "", appWebUsuarios: "", appWebRoles: [], appWebRolesDetalle: "", appWebReportes: "",
  appMobilePlataforma: "", appMobileTipo: "", appMobileFuncionalidades: [], appMobilePublicacion: "",
  moodleUso: "", moodleUsuarios: "", moodleClases: "", moodleDiseno: "",
};

function hasValue(value) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

export function createWizardState(project) {
  const countryCode = detectBrowserCountry();
  return { ...DEFAULT_STATE, project, telefonoPais: countryCode, pais: countryCode };
}

export function getBillingCountry(countryCode) {
  return BILLING_COUNTRIES.find(([code]) => code === String(countryCode || "").toUpperCase());
}

export function detectBrowserCountry() {
  if (typeof navigator === "undefined") return "";
  const locale = [...(navigator.languages || []), navigator.language]
    .find((value) => /-[a-z]{2}$/i.test(value || ""));
  const countryCode = locale?.match(/-([a-z]{2})$/i)?.[1]?.toUpperCase();
  if (getBillingCountry(countryCode)) return countryCode;
  return TIME_ZONE_COUNTRIES[Intl.DateTimeFormat().resolvedOptions().timeZone] || "";
}

export function formatBillingPhone(phone, countryCode) {
  const value = String(phone || "").trim();
  if (!value || value.startsWith("+")) return value;
  const country = getBillingCountry(countryCode);
  if (!country) return value;
  const digits = value.replace(/\D/g, "");
  if (!digits) return value;
  const dialDigits = country[2].slice(1);
  if (digits.startsWith(dialDigits)) return `+${digits}`;
  return `${country[2]}${digits.replace(/^0+/, "")}`;
}

export function getPriceCards(project) {
  return PRICE_CARDS[project] ?? [];
}

export function getRoute(project, state) {
  const route = [...(PROJECT_ROUTES[project] ?? [])];
  if (project !== "Plataforma de cursos Moodle") return route;

  const isInstitutional = state.moodleUsuarios !== "bajo"
    || state.moodleClases === "en_vivo"
    || state.moodleDiseno === "a_medida";
  const moodleRoute = route.map((step) => step.id === "contact"
    ? { ...step, title: isInstitutional ? "Proyecto Institucional" : step.title }
    : step);
  moodleRoute.push({ id: isInstitutional ? "submit" : "payment", title: isInstitutional ? "Enviar solicitud" : "Facturación y pago", required: isInstitutional ? [] : BILLING_FIELDS });
  return moodleRoute;
}

export function validateStep(project, step, state) {
  const definition = getRoute(project, state).find((item) => item.id === step);
  if (!definition) return false;
  if (step === "business" && state.domainStatus === "no_tengo" && !state.domainName.trim()) return false;
  if (step === "solution" && state.appWebObjetivo === "otros" && !state.appWebObjetivoDetalle.trim()) return false;
  if (step === "users" && state.appWebRoles.includes("otros") && !state.appWebRolesDetalle.trim()) return false;
  if ((step === "billing" || step === "payment") && state.metodoPago === "transferencia" && !state.comprobante) return false;
  return definition.required.every((field) => hasValue(state[field]));
}

export function getSelectedPrice(state) {
  return getPriceCards(state.project).find((card) => card.id === state.selectedPrice) ?? null;
}

export function buildSubmission(project, state) {
  const endpointByProject = {
    "Desarrollo de Software": "/api/send-software-request",
    "Aplicación Web": "/api/send-webapp-request",
    "Aplicación Móvil": "/api/send-mobileapp-request",
    "Plataforma de cursos Moodle": "/api/send-moodle-request",
  };
  const price = getSelectedPrice(state);
  return {
    endpoint: endpointByProject[project] ?? "/api/save-wizard-data",
    project,
    price,
    data: {
      ...state,
      telefono: formatBillingPhone(state.telefono, state.telefonoPais),
      paisNombre: getBillingCountry(state.pais)?.[1] || "",
      plan: project,
      planId: state.selectedPrice,
      amount: price?.price ?? null,
    },
  };
}
