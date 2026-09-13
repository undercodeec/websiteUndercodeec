import { buildSubmission, createWizardState, getPriceCards, getRoute, getSelectedPrice, validateStep } from "./offbrand-wizard-flow.mjs";
import { openPayment, submitQuote, submitTransfer } from "./offbrand-wizard-payment.mjs";

const sectors = ["Comercio y ventas", "Servicios profesionales", "Salud y bienestar", "Educación", "Tecnología", "Otro"];
const escape = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));

function field(name, label, type = "text", required = true, placeholder = "") {
  return `<label class="offbrand-wizard-field"><span>${label}${required ? " *" : ""}</span><input class="offbrand-wizard-input" name="${name}" type="${type}" value="${escape(currentState[name])}" placeholder="${placeholder}" ${required ? "required" : ""}></label>`;
}

function choices(name, label, values, multiple = false) {
  const selected = currentState[name];
  return `<fieldset class="offbrand-wizard-fieldset"><legend>${label}</legend><div class="offbrand-wizard-choice-grid">${values.map(([value, text]) => `<label class="offbrand-wizard-choice"><input name="${name}" type="${multiple ? "checkbox" : "radio"}" value="${escape(value)}" ${multiple ? selected.includes(value) : selected === value ? "checked" : ""}><span>${text}</span></label>`).join("")}</div></fieldset>`;
}

let currentState = null;

function renderBusiness() {
  return `<div class="offbrand-wizard-form-grid">${field("businessName", "Nombre del negocio o proyecto", "text", true, "Ej. Mi empresa")}<label class="offbrand-wizard-field"><span>Sector *</span><select class="offbrand-wizard-input" name="sector" required><option value="">Selecciona una opción</option>${sectors.map((item) => `<option value="${item}" ${currentState.sector === item ? "selected" : ""}>${item}</option>`).join("")}</select></label>${choices("domainStatus", "¿Tienes dominio?", [["tengo", "Ya tengo dominio"], ["no_tengo", "Necesito uno"], ["migrar", "Quiero migrar"]])}</div>`;
}

function renderBilling() {
  const price = getSelectedPrice(currentState);
  return `<div class="offbrand-wizard-summary">${price ? `<span>Plan: ${escape(price.label)}</span><strong>$${price.price.toLocaleString("en-US")} USD</strong>` : ""}</div><div class="offbrand-wizard-form-grid">${choices("tipoCliente", "Tipo de cliente", [["consumidor_final", "Persona natural"], ["empresa", "Empresa"]])}${field("rucCedula", "Documento de identidad o RUC")}${field("razonSocial", "Nombre completo o razón social")}${field("email", "Correo electrónico", "email", true, "correo@ejemplo.com")}${field("telefono", "Teléfono", "tel", true, "+593")}${field("callePrincipal", "Dirección")}${field("ciudad", "Ciudad")}${field("provincia", "Provincia")}</div>${choices("tipoPago", "Forma de pago", [["total", "Pago total"], ["anticipo", "Anticipo 50%"]])}${choices("metodoPago", "Método de pago", [["tarjeta", "Tarjeta / PayPhone"], ["transferencia", "Transferencia bancaria"]])}${currentState.metodoPago === "transferencia" ? `<label class="offbrand-wizard-field"><span>Comprobante de transferencia *</span><input class="offbrand-wizard-input" name="comprobante" type="file" accept="image/*,application/pdf"></label>` : ""}<label class="offbrand-wizard-terms"><input name="termsAccepted" type="checkbox" ${currentState.termsAccepted ? "checked" : ""}> <span>Acepto los términos y el tratamiento de mis datos.</span></label>`;
}

function renderStepContent(step) {
  if (step.id === "price") return `<div class="offbrand-wizard-price-grid">${getPriceCards(currentState.project).map((card) => `<button type="button" class="offbrand-wizard-price-card ${currentState.selectedPrice === card.id ? "is-selected" : ""}" data-wizard-price="${card.id}"><span>${escape(card.label)}</span><strong>$${card.price.toLocaleString("en-US")}</strong><small>${escape(card.description)}</small></button>`).join("")}</div>`;
  if (step.id === "business") return renderBusiness();
  if (step.id === "billing" || step.id === "payment") return renderBilling();
  if (step.id === "discovery") return `<div class="offbrand-wizard-form-grid">${choices("softwareObjetivo", "Objetivo", [["automatizar", "Automatizar procesos"], ["saas", "Crear un SaaS"], ["reemplazar", "Actualizar sistema"], ["conectar", "Conectar sistemas"]])}${field("softwareProblema", "¿Qué problema resolverá?", "text", true, "Describe brevemente")}${choices("softwareEstado", "Estado actual", [["idea", "Es una idea"], ["documentado", "Tengo requerimientos"], ["existente", "Ya existe una versión"]])}</div>`;
  if (step.id === "scope") return `<div class="offbrand-wizard-form-grid">${choices("softwareEscala", "Cantidad de usuarios", [["personal", "Menos de 5"], ["equipo", "5 a 20"], ["empresa", "20 a 100"], ["masivo", "Público general"]])}${choices("softwareRoles", "Roles necesarios", [["admin", "Administración"], ["empleados", "Operadores"], ["clientes", "Clientes"], ["reportes", "Reportes"]], true)}</div>`;
  if (step.id === "solution") return `<div class="offbrand-wizard-form-grid">${choices("appWebObjetivo", "Objetivo", [["interno", "Uso interno"], ["saas", "SaaS"], ["clientes", "Portal de clientes"], ["otros", "Otro"]])}${currentState.appWebObjetivo === "otros" ? field("appWebObjetivoDetalle", "Describe el objetivo") : ""}${choices("appWebMobile", "Experiencia", [["responsive", "Responsive"], ["pwa", "PWA"], ["desktop", "Escritorio"]])}${field("appWebDescripcion", "Describe la aplicación", "text", true, "Funciones principales")}</div>`;
  if (step.id === "users") return `<div class="offbrand-wizard-form-grid">${choices("appWebUsuarios", "Usuarios", [["pequeno", "Pocos usuarios"], ["mediano", "Equipo mediano"], ["masivo", "Muchos usuarios"]])}${choices("appWebRoles", "Roles", [["admin", "Administración"], ["editores", "Edición"], ["lectores", "Lectura"], ["otros", "Otro"]], true)}${choices("appWebReportes", "Reportes", [["dashboards", "Paneles"], ["export", "Exportación"], ["none", "No necesarios"]])}</div>`;
  if (step.id === "platform") return `<div class="offbrand-wizard-form-grid">${choices("appMobilePlataforma", "Plataforma", [["android", "Android"], ["ios", "iOS"], ["ambos", "Android e iOS"]])}${choices("appMobileTipo", "Tipo de aplicación", [["gestion", "Gestión interna"], ["clientes", "Para clientes"], ["informativa", "Informativa"]])}</div>`;
  if (step.id === "features") return `<div class="offbrand-wizard-form-grid">${choices("appMobileFuncionalidades", "Funciones", [["gps", "GPS"], ["camara", "Cámara"], ["push", "Notificaciones"], ["offline", "Sin conexión"]], true)}${choices("appMobilePublicacion", "Publicación", [["ayuda", "Necesito ayuda"], ["cuentas", "Tengo cuentas de tienda"]])}</div>`;
  if (step.id === "scale") return `<div class="offbrand-wizard-form-grid">${choices("moodleUso", "Uso principal", [["colegio", "Institución educativa"], ["capacitacion", "Capacitación"], ["venta", "Venta de cursos"]])}${choices("moodleUsuarios", "Cantidad de usuarios", [["bajo", "Hasta 100"], ["medio", "100 a 500"], ["alto", "Más de 500"]])}</div>`;
  if (step.id === "content") return `<div class="offbrand-wizard-form-grid">${choices("moodleClases", "Modalidad", [["asincronicas", "Cursos grabados"], ["en_vivo", "Clases en vivo"]])}${choices("moodleDiseno", "Diseño", [["estandar", "Plantilla estándar"], ["a_medida", "Diseño a medida"]])}</div>`;
  if (step.id === "contact") return `<div class="offbrand-wizard-form-grid">${field("softwareNombre", "Nombre completo")}${field("softwareEmail", "Correo electrónico", "email", true, "correo@ejemplo.com")}${field("softwareTelefono", "Teléfono", "tel", false, "+593")}${currentState.project === "Desarrollo de Software" ? `${choices("softwarePresupuesto", "Presupuesto", [["bajo", "Menos de $1.000"], ["mvp", "$1.000 a $3.000"], ["pyme", "$3.000 a $5.000"], ["complejo", "Más de $5.000"]])}${choices("softwareTiempo", "Tiempo", [["urgente", "Urgente"], ["corto", "1 a 2 meses"], ["largo", "Sin apuro"]])}` : ""}</div>`;
  return `<div class="offbrand-wizard-review"><p>Revisa tu información y envíanos la solicitud. Un asesor preparará la siguiente propuesta contigo.</p></div>`;
}

function syncState(form) {
  const data = new FormData(form);
  for (const [name, value] of data.entries()) if (name !== "comprobante") currentState[name] = value;
  ["softwareRoles", "appWebRoles", "appMobileFuncionalidades"].forEach((name) => { currentState[name] = [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value); });
  currentState.termsAccepted = form.querySelector('input[name="termsAccepted"]')?.checked ?? false;
  const file = form.querySelector('input[name="comprobante"]')?.files?.[0];
  if (file) currentState.comprobante = file;
}

export function createOffbrandWizard({ plansGrid, onClose }) {
  const host = document.createElement("section");
  host.className = "offbrand-wizard";
  host.dataset.offbrandWizard = "";
  host.hidden = true;
  plansGrid.append(host);
  let stepIndex = 0;
  const render = () => {
    const route = getRoute(currentState.project, currentState);
    const step = route[stepIndex];
    host.innerHTML = `<div class="offbrand-wizard-toolbar"><button type="button" class="offbrand-wizard-back" data-wizard-close>← Cambiar proyecto</button><span>${stepIndex + 1} / ${route.length}</span></div><form class="offbrand-wizard-body" novalidate><p class="text-mini caps">${escape(currentState.project)}</p><h3 class="h-c">${escape(step.title)}</h3><p class="offbrand-wizard-error" data-wizard-error aria-live="polite"></p>${renderStepContent(step)}<div class="offbrand-wizard-actions">${stepIndex ? `<button type="button" class="offbrand-wizard-button is-secondary" data-wizard-prev>Anterior</button>` : ""}${step.id === "submit" ? `<button type="button" class="offbrand-wizard-button" data-wizard-submit>Enviar solicitud</button>` : `<button type="button" class="offbrand-wizard-button" data-wizard-next>${stepIndex === route.length - 1 ? "Continuar" : "Siguiente"}</button>`}</div></form>`;
  };
  const showError = (message) => { host.querySelector("[data-wizard-error]").textContent = message; };
  host.addEventListener("click", async (event) => {
    const priceId = event.target.closest("[data-wizard-price]")?.dataset.wizardPrice;
    if (priceId) { currentState.selectedPrice = priceId; render(); return; }
    if (event.target.closest("[data-wizard-close]")) { host.hidden = true; plansGrid.classList.remove("is-wizard-open"); onClose?.(); return; }
    const form = host.querySelector("form");
    syncState(form);
    if (event.target.closest("[data-wizard-prev]")) { stepIndex -= 1; render(); return; }
    const route = getRoute(currentState.project, currentState);
    const step = route[stepIndex];
    if (event.target.closest("[data-wizard-submit]")) { try { await submitQuote(buildSubmission(currentState.project, currentState)); host.innerHTML = `<div class="offbrand-wizard-confirmation"><h3 class="h-c">Solicitud enviada</h3><p>Gracias. Nuestro equipo se pondrá en contacto contigo.</p><button type="button" class="offbrand-wizard-button" data-wizard-close>Cerrar</button></div>`; } catch (error) { showError(error.message); } return; }
    if (!validateStep(currentState.project, step.id, currentState)) { showError("Completa los campos obligatorios para continuar."); return; }
    if (stepIndex === route.length - 1 && (step.id === "billing" || step.id === "payment")) {
      const request = { project: currentState.project, price: getSelectedPrice(currentState), data: currentState };
      try { if (currentState.metodoPago === "transferencia") { if (!currentState.comprobante) throw new Error("Adjunta el comprobante de transferencia."); await submitTransfer(request); host.innerHTML = `<div class="offbrand-wizard-confirmation"><h3 class="h-c">Transferencia registrada</h3><p>Verificaremos tu comprobante y te contactaremos.</p><button type="button" class="offbrand-wizard-button" data-wizard-close>Cerrar</button></div>`; } else { await openPayment(request, () => { host.innerHTML = `<div class="offbrand-wizard-confirmation"><h3 class="h-c">Pago confirmado</h3><p>Recibimos tu pago correctamente.</p><button type="button" class="offbrand-wizard-button" data-wizard-close>Cerrar</button></div>`; }, (error) => showError(error.message)); } } catch (error) { showError(error.message); } return;
    }
    stepIndex += 1; render();
  });
  return { open(project) { currentState = createWizardState(project); stepIndex = 0; host.hidden = false; plansGrid.classList.add("is-wizard-open"); render(); }, close() { host.hidden = true; plansGrid.classList.remove("is-wizard-open"); } };
}
