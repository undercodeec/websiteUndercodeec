const PRICE_CARDS = {
  "Sitio Web": [
    { id: "web-launch", label: "Plan de Lanzamiento", price: 360, description: "Presencia digital profesional" },
    { id: "web-growth", label: "Plan de Crecimiento", price: 510, description: "Web estratégica y captación" },
    { id: "web-authority", label: "Plan de Autoridad", price: 1010, description: "Ecosistema corporativo" },
  ],
  "Landing Page": [
    { id: "landing-basic", label: "Landing Básica", price: 150, description: "Captación de leads" },
    { id: "landing-pro", label: "Landing Pro", price: 280, description: "Marketing integrado" },
    { id: "landing-premium", label: "Landing Premium", price: 500, description: "Embudo automatizado" },
  ],
  "Tienda Online": [
    { id: "store-launch", label: "Tienda de Lanzamiento", price: 850, description: "Para iniciar ventas online" },
    { id: "store-growth", label: "Tienda de Crecimiento", price: 2500, description: "Para escalar ventas" },
    { id: "store-elite", label: "Tienda Élite", price: 20000, description: "Arquitectura de alto rendimiento" },
  ],
};

const BUSINESS_FIELDS = ["businessName", "sector", "domainStatus"];
const BILLING_FIELDS = ["tipoCliente", "rucCedula", "razonSocial", "email", "telefono", "callePrincipal", "ciudad", "provincia", "metodoPago", "termsAccepted"];

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
    { id: "business", title: "Sobre tu negocio", required: BUSINESS_FIELDS },
    { id: "solution", title: "La solución", required: ["appWebObjetivo", "appWebMobile", "appWebDescripcion"] },
    { id: "users", title: "Usuarios y reportes", required: ["appWebUsuarios", "appWebRoles", "appWebReportes"] },
    { id: "contact", title: "Datos de contacto", required: ["softwareNombre", "softwareEmail"] },
    { id: "submit", title: "Enviar solicitud", required: [] },
  ],
  "Aplicación Móvil": [
    { id: "business", title: "Sobre tu negocio", required: BUSINESS_FIELDS },
    { id: "platform", title: "Plataforma", required: ["appMobilePlataforma", "appMobileTipo"] },
    { id: "features", title: "Funciones", required: ["appMobileFuncionalidades", "appMobilePublicacion"] },
    { id: "contact", title: "Datos de contacto", required: ["softwareNombre", "softwareEmail"] },
    { id: "submit", title: "Enviar solicitud", required: [] },
  ],
  "Plataforma de cursos Moodle": [
    { id: "business", title: "Sobre tu institución", required: BUSINESS_FIELDS },
    { id: "scale", title: "Uso y escala", required: ["moodleUso", "moodleUsuarios"] },
    { id: "content", title: "Contenido y diseño", required: ["moodleClases", "moodleDiseno"] },
    { id: "contact", title: "Datos de contacto", required: ["softwareNombre", "softwareEmail"] },
  ],
};

const DEFAULT_STATE = {
  selectedPrice: "", businessName: "", sector: "", domainStatus: "", domainName: "",
  tipoCliente: "", rucCedula: "", razonSocial: "", email: "", telefono: "",
  callePrincipal: "", calleSecundaria: "", ciudad: "", provincia: "", codigoPostal: "", pais: "Ecuador",
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
  return { ...DEFAULT_STATE, project };
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
  route.push({ id: isInstitutional ? "submit" : "payment", title: isInstitutional ? "Enviar solicitud" : "Facturación y pago", required: isInstitutional ? [] : BILLING_FIELDS });
  return route;
}

export function validateStep(project, step, state) {
  const definition = getRoute(project, state).find((item) => item.id === step);
  if (!definition) return false;
  if (step === "solution" && state.appWebObjetivo === "otros" && !state.appWebObjetivoDetalle.trim()) return false;
  if (step === "users" && state.appWebRoles.includes("otros") && !state.appWebRolesDetalle.trim()) return false;
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
    data: { ...state, plan: project, planId: state.selectedPrice, amount: price?.price ?? null },
  };
}
