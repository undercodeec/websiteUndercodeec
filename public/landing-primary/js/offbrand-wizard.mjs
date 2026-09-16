import { BILLING_COUNTRIES, buildSubmission, createWizardState, getBillingCountry, getPriceCards, getRoute, getSelectedPrice, validateStep } from "./offbrand-wizard-flow.mjs";
import { openPayment, submitQuote, submitTransfer } from "./offbrand-wizard-payment.mjs";

const sectors = ["Comercio y ventas", "Servicios profesionales", "Salud y bienestar", "Educación", "Tecnología", "Otro"];
const mobileAppSectors = ["Comercio y Ventas", "Servicios Profesionales", "Salud y Bienestar", "Construcción e Inmobiliaria", "Agricultura y Alimentos", "Educación y Capacitación", "Turismo y Hotelería", "Arte y Entretenimiento", "Tecnología", "Otros"];
const moodleSectors = ["Colegio / Escuela", "Universidad / Instituto", "Empresa (Capacitación)", "Academia Online", "Otro"];
const escape = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
const formatPrice = (price) => `USD $${Number(price).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} incluido IVA`;
const BANK_TRANSFER_DETAILS = [
  ["Banco", "Pichincha"],
  ["Titular", "Christopher Alexander Gallardo Campos"],
  ["Cédula", "1727155671"],
  ["N.º de cuenta", "2212385867"],
  ["Tipo de cuenta", "Ahorros"],
  ["Celular / WhatsApp", "0999739534"],
];

function field(name, label, type = "text", required = true, placeholder = "") {
  return `<label class="offbrand-wizard-field"><span>${label}${required ? " *" : ""}</span><input class="offbrand-wizard-input" name="${name}" type="${type}" value="${escape(currentState[name])}" placeholder="${placeholder}" ${required ? "required" : ""}></label>`;
}

function choices(name, label, values, multiple = false, hint = "") {
  const selected = currentState[name];
  return `<fieldset class="offbrand-wizard-fieldset"><legend>${label}</legend>${hint ? `<p class="offbrand-wizard-field-hint">${hint}</p>` : ""}<div class="offbrand-wizard-choice-grid">${values.map(([value, text]) => `<label class="offbrand-wizard-choice"><input name="${name}" type="${multiple ? "checkbox" : "radio"}" value="${escape(value)}" ${multiple ? selected.includes(value) : selected === value ? "checked" : ""}><span>${text}</span></label>`).join("")}</div></fieldset>`;
}

let currentState = null;

function renderBusiness() {
  const domainField = currentState.domainStatus === "no_tengo"
    ? field("domainName", "Nombre de dominio que deseas", "text", true, "Ej. minegocio.com")
    : "";
  return `<div class="offbrand-wizard-form-grid">${field("businessName", "Nombre del negocio o proyecto", "text", true, "Ej. Mi empresa")}<label class="offbrand-wizard-field"><span>Sector *</span><select class="offbrand-wizard-input" name="sector" required><option value="">Selecciona una opción</option>${sectors.map((item) => `<option value="${item}" ${currentState.sector === item ? "selected" : ""}>${item}</option>`).join("")}</select></label>${choices("domainStatus", "¿Tienes dominio?", [["tengo", "Ya tengo dominio"], ["no_tengo", "Necesito uno"], ["migrar", "Quiero migrar"]])}${domainField}</div>`;
}

function renderMobileAppBusiness() {
  return `<div class="offbrand-wizard-form-grid">${field("businessName", "Nombre de la App", "text", true, "Ej. Mi Tienda App")}<label class="offbrand-wizard-field"><span>Sector / Categoría *</span><select class="offbrand-wizard-input" name="sector" required><option value="">Selecciona una categoría</option>${mobileAppSectors.map((item) => `<option value="${item}" ${currentState.sector === item ? "selected" : ""}>${item}</option>`).join("")}</select></label>${choices("domainStatus", "¿Tienes sitio web actualmente?", [["tengo", "Sí, quiero convertirlo en App"], ["necesito", "No, es un proyecto nuevo"]])}</div>`;
}

function renderMobileAppContact() {
  return `<p class="offbrand-wizard-intro">Hemos recibido tus requerimientos para tu App Móvil. Déjanos tus datos para enviarte una propuesta preliminar y agendar una sesión técnica si es necesario.</p><div class="offbrand-wizard-form-grid">${field("softwareNombre", "Tu Nombre", "text", true, "Ej. Juan Pérez")}${field("softwareTelefono", "Teléfono / WhatsApp", "tel", false, "Tu número de teléfono")}${field("softwareEmail", "Email Corporativo", "email", true, "juan@empresa.com")}</div>`;
}

function renderWebAppBusiness() {
  return `<p class="offbrand-wizard-intro">Para empezar, cuéntanos quién eres.</p><div class="offbrand-wizard-form-grid">${field("businessName", "Nombre de tu Proyecto o Empresa", "text", true, "Ej. Sistema de Inventarios X")}<label class="offbrand-wizard-field"><span>¿A qué sector pertenece? *</span><select class="offbrand-wizard-input" name="sector" required><option value="">Selecciona un sector</option>${mobileAppSectors.map((item) => `<option value="${item}" ${currentState.sector === item ? "selected" : ""}>${item}</option>`).join("")}</select></label>${choices("domainStatus", "¿Tienes dominio para tu aplicación?", [["tengo", "Sí, ya tengo (Ej: app.miempresa.com)"], ["necesito", "No, necesito asesoría"], ["interno", "Es para uso interno (Intranet)"]])}</div>`;
}

function renderWebAppContact() {
  return `<p class="offbrand-wizard-intro">Hemos recibido tus requerimientos para tu Aplicación Web Cloud. Déjanos tus datos para enviarte una propuesta preliminar y agendar una sesión técnica si es necesario.</p><div class="offbrand-wizard-form-grid">${field("softwareNombre", "Tu Nombre", "text", true, "Ej. Juan Pérez")}${field("softwareTelefono", "Teléfono / WhatsApp", "tel", false, "Tu número de teléfono")}${field("softwareEmail", "Email Corporativo", "email", true, "juan@empresa.com")}</div>`;
}

function isMoodleInstitutional() {
  return currentState.moodleUsuarios !== "bajo"
    || currentState.moodleClases === "en_vivo"
    || currentState.moodleDiseno === "a_medida";
}

function renderMoodleBusiness() {
  return `<p class="offbrand-wizard-intro">Datos de la institución o empresa educativa.</p><div class="offbrand-wizard-form-grid">${field("businessName", "Nombre de la Institución / Empresa", "text", true, "Ej. Academia de Idiomas X")}<label class="offbrand-wizard-field"><span>Sector Educativo *</span><select class="offbrand-wizard-input" name="sector" required><option value="">Selecciona...</option>${moodleSectors.map((item) => `<option value="${item}" ${currentState.sector === item ? "selected" : ""}>${item}</option>`).join("")}</select></label>${choices("domainStatus", "Dominio / URL", [["tengo", "Ya tengo dominio (ej. miacademia.com)"], ["necesito", "No tengo, necesito uno"]])}</div>`;
}

function renderMoodleContact() {
  if (!isMoodleInstitutional()) return `<div class="offbrand-wizard-form-grid">${field("softwareNombre", "Nombre completo")}${field("softwareEmail", "Correo electrónico", "email", true, "correo@ejemplo.com")}${field("softwareTelefono", "Teléfono", "tel", false, "+593")}</div>`;
  return `<p class="offbrand-wizard-intro">Para garantizar la estabilidad de tu aula con esa cantidad de alumnos y personalización, necesitamos dimensionar tu servidor. Te contactaremos con una propuesta técnica.</p><div class="offbrand-wizard-form-grid">${field("softwareNombre", "Tu Nombre")}${field("softwareTelefono", "Teléfono", "tel", false)}${field("softwareEmail", "Email", "email", true, "correo@ejemplo.com")}</div>`;
}

function renderTransferDetails(price) {
  const amount = currentState.tipoPago === "anticipo" ? Math.round(price.price / 2) : price.price;
  return `<section class="offbrand-transfer-details" aria-live="polite"><p class="offbrand-transfer-amount">Monto a transferir: <strong>USD $${Number(amount).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p><div class="offbrand-transfer-card"><h4>Datos bancarios para transferencia</h4><dl class="offbrand-transfer-grid">${BANK_TRANSFER_DETAILS.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl><p class="offbrand-transfer-note">Realiza la transferencia y adjunta el comprobante para registrar tu pedido.</p></div><label class="offbrand-wizard-field"><span>Comprobante de transferencia *</span><input class="offbrand-wizard-input" name="comprobante" type="file" accept="image/jpeg,image/png,application/pdf" required aria-describedby="transfer-voucher-help"><small id="transfer-voucher-help">Formatos permitidos: JPG, PNG o PDF. Máximo 10 MB.</small></label></section>`;
}

function renderBilling() {
  const price = getSelectedPrice(currentState);
  const phoneCountries = BILLING_COUNTRIES.map(([code, name, dialCode]) => `<option value="${code}" ${currentState.telefonoPais === code ? "selected" : ""}>${escape(name)} (${dialCode})</option>`).join("");
  const billingCountries = BILLING_COUNTRIES.map(([code, name]) => `<option value="${code}" ${currentState.pais === code ? "selected" : ""}>${escape(name)}</option>`).join("");
  const phoneField = `<label class="offbrand-wizard-field"><span>Teléfono *</span><div class="offbrand-wizard-phone-control"><select class="offbrand-wizard-input" name="telefonoPais" required><option value="">Código de país</option>${phoneCountries}</select><input class="offbrand-wizard-input" name="telefono" type="tel" value="${escape(currentState.telefono)}" placeholder="Número sin código de país" inputmode="tel" required></div></label>`;
  const countryField = `<label class="offbrand-wizard-field"><span>País de facturación *</span><select class="offbrand-wizard-input" name="pais" required><option value="">Selecciona tu país</option>${billingCountries}</select></label>`;
  return `<div class="offbrand-wizard-summary">${price ? `<span>Plan: ${escape(price.label)}</span><strong>${formatPrice(price.price)}</strong>` : ""}</div><div class="offbrand-wizard-form-grid">${choices("tipoCliente", "Tipo de cliente", [["consumidor_final", "Persona natural"], ["empresa", "Empresa"]])}${field("rucCedula", "Documento de identidad o RUC")}${field("razonSocial", "Nombre completo o razón social")}${field("email", "Correo electrónico", "email", true, "correo@ejemplo.com")}${phoneField}${countryField}${field("callePrincipal", "Dirección")}${field("ciudad", "Ciudad")}${field("provincia", "Provincia")}</div>${choices("tipoPago", "Forma de pago", [["total", "Pago total"], ["anticipo", "Anticipo 50%"]])}${choices("metodoPago", "Método de pago", [["tarjeta", "Tarjeta / PayPhone"], ["transferencia", "Transferencia bancaria"]])}${currentState.metodoPago === "transferencia" && price ? renderTransferDetails(price) : ""}<label class="offbrand-wizard-terms"><input name="termsAccepted" type="checkbox" ${currentState.termsAccepted ? "checked" : ""}> <span>Acepto los términos y el tratamiento de mis datos.</span></label>`;
}

function renderPriceCard(card) {
  const isSelected = currentState.selectedPrice === card.id;
  const features = (card.features ?? []).map((feature) => `<span class="offbrand-wizard-price-feature"><span aria-hidden="true">✓</span>${escape(feature)}</span>`).join("");
  return `<button type="button" class="offbrand-wizard-price-card ${isSelected ? "is-selected" : ""}" data-wizard-price="${card.id}" aria-pressed="${isSelected}"><span class="offbrand-wizard-price-title">${escape(card.label)}</span><strong>${formatPrice(card.price)}</strong><small>${escape(card.description)}</small>${features ? `<span class="offbrand-wizard-price-features">${features}</span>` : ""}</button>`;
}

function renderStepContent(step) {
  if (step.id === "price") return `<div class="offbrand-wizard-price-grid">${getPriceCards(currentState.project).map(renderPriceCard).join("")}</div>`;
  if (step.id === "business") {
    if (currentState.project === "Aplicación Móvil") return renderMobileAppBusiness();
    if (currentState.project === "Aplicación Web") return renderWebAppBusiness();
    if (currentState.project === "Plataforma de cursos Moodle") return renderMoodleBusiness();
    return renderBusiness();
  }
  if (step.id === "billing" || step.id === "payment") return renderBilling();
  if (step.id === "discovery") return `<div class="offbrand-wizard-form-grid">${choices("softwareObjetivo", "Objetivo", [["automatizar", "Automatizar procesos"], ["saas", "Crear un SaaS"], ["reemplazar", "Actualizar sistema"], ["conectar", "Conectar sistemas"]])}${field("softwareProblema", "¿Qué problema resolverá?", "text", true, "Describe brevemente")}${choices("softwareEstado", "Estado actual", [["idea", "Es una idea"], ["documentado", "Tengo requerimientos"], ["existente", "Ya existe una versión"]])}</div>`;
  if (step.id === "scope") return `<div class="offbrand-wizard-form-grid">${choices("softwareEscala", "Cantidad de usuarios", [["personal", "Menos de 5"], ["equipo", "5 a 20"], ["empresa", "20 a 100"], ["masivo", "Público general"]])}${choices("softwareRoles", "Roles necesarios", [["admin", "Administración"], ["empleados", "Operadores"], ["clientes", "Clientes"], ["reportes", "Reportes"]], true)}</div>`;
  if (step.id === "solution") return `<p class="offbrand-wizard-intro">Define el enfoque de tu aplicación.</p><div class="offbrand-wizard-form-grid">${choices("appWebObjetivo", "¿Cuál es el propósito principal?", [["interno", "Uso Interno (Herramienta de Gestión)"], ["saas", "Producto Comercial (SaaS)"], ["clientes", "Portal de Clientes"], ["otros", "Otro (Especificar)"]])}${currentState.appWebObjetivo === "otros" ? field("appWebObjetivoDetalle", "Especifique el propósito", "text", true, "Especifique el propósito...") : ""}${choices("appWebMobile", "¿Necesitas que funcione en celulares?", [["responsive", "Sí, Responsive (Adaptable)"], ["pwa", "Sí, PWA (Tipo App Móvil)"], ["desktop", "No es prioridad (Uso en PC)"]])}<label class="offbrand-wizard-field"><span>Describe brevemente qué hará la aplicación *</span><textarea class="offbrand-wizard-input" name="appWebDescripcion" required placeholder="Ej: Quiero un sistema donde mis vendedores registren visitas...">${escape(currentState.appWebDescripcion)}</textarea></label></div>`;
  if (step.id === "users") return `<p class="offbrand-wizard-intro">Dimensionamiento del sistema.</p><div class="offbrand-wizard-form-grid">${choices("appWebUsuarios", "¿Cuántos usuarios estimas?", [["pequeno", "Pequeño: 1 - 50 usuarios"], ["mediano", "Mediano: 50 - 500 usuarios"], ["masivo", "Masivo: +500 usuarios"]])}${choices("appWebRoles", "¿Qué roles de seguridad necesitas?", [["admin", "Super Administrador (Ve todo)"], ["editores", "Editores / Empleados (Carga de datos)"], ["lectores", "Lectores / Clientes (Solo lectura)"], ["auditores", "Auditores"], ["otros", "Otros (Especificar)"]], true)}${currentState.appWebRoles.includes("otros") ? field("appWebRolesDetalle", "Especifique los roles", "text", true, "Especifique los roles...") : ""}${choices("appWebReportes", "¿Requiere reportes o gráficos?", [["dashboards", "Sí, Dashboards en tiempo real"], ["export", "Solo exportar a Excel/PDF"], ["none", "No necesito reportes complejos"]])}</div>`;
  if (step.id === "platform") return `<p class="offbrand-wizard-intro">Objetivo: Definir si desarrollas una o dos apps.</p><div class="offbrand-wizard-form-grid">${choices("appMobilePlataforma", "1. ¿En qué dispositivos debe funcionar?", [["android", "Solo Android (Más económico y con mayor cuota de mercado)"], ["ios", "Solo iPhone (iOS)"], ["ambos", "En ambos (Android + iOS) (Requiere desarrollo híbrido o doble esfuerzo)"]])}${choices("appMobileTipo", "2. ¿Qué tipo de App es?", [["gestion", "App de Gestión/Interna (Para mis empleados/vendedores)"], ["clientes", "App para Clientes/Público (Tienda, Delivery, Red Social)"], ["informativa", "App Informativa (Catálogo, Noticias)"]])}</div>`;
  if (step.id === "features") return `<p class="offbrand-wizard-intro">Objetivo: Detectar funciones nativas costosas.</p><div class="offbrand-wizard-form-grid">${choices("appMobileFuncionalidades", "1. ¿Necesitas funciones nativas del celular?", [["gps", "Geolocalización / Mapas (GPS) (Ej: Rastreo de pedidos)"], ["camara", "Cámara / Escáner QR"], ["push", "Notificaciones Push (Alertas al celular)"], ["offline", "Funcionamiento Offline (Sin internet)"], ["none", "Ninguna, solo mostrar información"]], true)}${choices("appMobilePublicacion", "2. Publicación en Tiendas:", [["ayuda", "Necesito ayuda para subirla a Play Store y App Store."], ["tengo_cuentas", "Ya tengo mis cuentas de desarrollador, solo necesito el archivo (APK/IPA)."]])}</div>`;
  if (step.id === "scale") return `<p class="offbrand-wizard-intro">Objetivo: Calcular el tamaño del VPS/Hosting.</p><div class="offbrand-wizard-form-grid">${choices("moodleUso", "1. ¿Cuál es el uso principal?", [["colegio", "Colegio / Universidad (Educación formal, notas, periodos)"], ["capacitacion", "Capacitación Corporativa (Cursos para empleados)"], ["venta", "Venta de Cursos (Academia online con pagos)"]])}${choices("moodleUsuarios", "2. ¿Cuántos estudiantes estimas tener activos AL MISMO TIEMPO?", [["bajo", "Bajo: Menos de 50 usuarios simultáneos."], ["medio", "Medio: 50 - 200 usuarios."], ["alto", "Alto: Más de 200 (Requiere servidor dedicado)."]], false, "Esta es la pregunta más importante para que no se caiga el servidor.")}</div>`;
  if (step.id === "content") return `<p class="offbrand-wizard-intro">Objetivo: Definir horas de configuración.</p><div class="offbrand-wizard-form-grid">${choices("moodleClases", "1. ¿Cómo serán las clases?", [["asincronicas", "Asincrónicas: Solo subiré videos grabados, PDFs y tareas."], ["en_vivo", "En Vivo: Necesito integración con Zoom / Teams / Meet."]])}${choices("moodleDiseno", "2. Diseño del Aula Virtual:", [["estandar", "Tema Estándar: Usar una plantilla limpia con mi logo. (Económico)"], ["a_medida", "Diseño A Medida: Personalización avanzada de la interfaz. (Costoso)"]])}</div>`;
  if (step.id === "contact") {
    if (currentState.project === "Aplicación Móvil") return renderMobileAppContact();
    if (currentState.project === "Aplicación Web") return renderWebAppContact();
    if (currentState.project === "Plataforma de cursos Moodle") return renderMoodleContact();
    return `<div class="offbrand-wizard-form-grid">${field("softwareNombre", "Nombre completo")}${field("softwareEmail", "Correo electrónico", "email", true, "correo@ejemplo.com")}${field("softwareTelefono", "Teléfono", "tel", false, "+593")}${currentState.project === "Desarrollo de Software" ? `${choices("softwarePresupuesto", "Presupuesto", [["bajo", "Menos de $1.000"], ["mvp", "$1.000 a $3.000"], ["pyme", "$3.000 a $5.000"], ["complejo", "Más de $5.000"]])}${choices("softwareTiempo", "Tiempo", [["urgente", "Urgente"], ["corto", "1 a 2 meses"], ["largo", "Sin apuro"]])}` : ""}</div>`;
  }
  return `<div class="offbrand-wizard-review"><p>Revisa tu información y envíanos la solicitud. Un asesor preparará la siguiente propuesta contigo.</p></div>`;
}

function syncState(form) {
  const data = new FormData(form);
  for (const [name, value] of data.entries()) if (name !== "comprobante") currentState[name] = value;
  ["softwareRoles", "appWebRoles", "appMobileFuncionalidades"].forEach((name) => { currentState[name] = [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value); });
  currentState.termsAccepted = form.querySelector('input[name="termsAccepted"]')?.checked ?? false;
  const voucherInput = form.querySelector('input[name="comprobante"]');
  if (voucherInput) currentState.comprobante = voucherInput.files?.[0] || null;
}

export function createOffbrandWizard({ plansGrid, onClose }) {
  const host = document.createElement("section");
  host.className = "offbrand-wizard";
  host.dataset.offbrandWizard = "";
  host.hidden = true;
  plansGrid.append(host);
  let stepIndex = 0;
  let countryWasEdited = false;
  const render = () => {
    const route = getRoute(currentState.project, currentState);
    const step = route[stepIndex];
    host.innerHTML = `<div class="offbrand-wizard-toolbar"><button type="button" class="offbrand-wizard-back" data-wizard-close>← Cambiar proyecto</button><span>${stepIndex + 1} / ${route.length}</span></div><form class="offbrand-wizard-body" novalidate><p class="text-mini caps">${escape(currentState.project)}</p><h3 class="h-c">${escape(step.title)}</h3><p class="offbrand-wizard-error" data-wizard-error aria-live="polite"></p>${renderStepContent(step)}<div class="offbrand-wizard-actions">${stepIndex ? `<button type="button" class="offbrand-wizard-button is-secondary" data-wizard-prev>Anterior</button>` : ""}${step.id === "submit" ? `<button type="button" class="offbrand-wizard-button" data-wizard-submit>Enviar solicitud</button>` : `<button type="button" class="offbrand-wizard-button" data-wizard-next>${stepIndex === route.length - 1 ? "Continuar" : "Siguiente"}</button>`}</div></form>`;
  };
  const showError = (message) => { host.querySelector("[data-wizard-error]").textContent = message; };
  const hydrateVisitorCountry = async () => {
    try {
      const apiUrl = window.__OFFBRAND_API_URL || "https://api.undercodeec.com";
      const response = await fetch(`${apiUrl}/api/visitor-country`);
      const { countryCode, source } = response.ok ? await response.json() : {};
      if (countryWasEdited || !getBillingCountry(countryCode)) return;

      const shouldOverride = source === "proxy_header";
      const phoneCountry = shouldOverride || !currentState.telefonoPais ? countryCode : currentState.telefonoPais;
      const billingCountry = shouldOverride || !currentState.pais ? countryCode : currentState.pais;
      if (phoneCountry === currentState.telefonoPais && billingCountry === currentState.pais) return;

      currentState = { ...currentState, telefonoPais: phoneCountry, pais: billingCountry };
      const step = getRoute(currentState.project, currentState)[stepIndex];
      if (step?.id === "billing" || step?.id === "payment") render();
    } catch {
      // La detección del navegador ya precarga el selector cuando la API no está disponible.
    }
  };
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
    if (!event.target.closest("[data-wizard-next]")) return;
    if (!validateStep(currentState.project, step.id, currentState)) { showError("Completa los campos obligatorios para continuar."); return; }
    if (stepIndex === route.length - 1 && (step.id === "billing" || step.id === "payment")) {
      const request = { project: currentState.project, price: getSelectedPrice(currentState), data: currentState };
      try { if (currentState.metodoPago === "transferencia") { if (!currentState.comprobante) throw new Error("Adjunta el comprobante de transferencia."); await submitTransfer(request); host.innerHTML = `<div class="offbrand-wizard-confirmation"><h3 class="h-c">Transferencia registrada</h3><p>Verificaremos tu comprobante y te contactaremos.</p><button type="button" class="offbrand-wizard-button" data-wizard-close>Cerrar</button></div>`; } else { await openPayment(request, () => { host.innerHTML = `<div class="offbrand-wizard-confirmation"><h3 class="h-c">Pago confirmado</h3><p>Recibimos tu pago correctamente.</p><button type="button" class="offbrand-wizard-button" data-wizard-close>Cerrar</button></div>`; }, (error) => showError(error.message)); } } catch (error) { showError(error.message); } return;
    }
    stepIndex += 1; render();
  });
  host.addEventListener("change", (event) => {
    if (["telefonoPais", "pais"].includes(event.target.name)) {
      countryWasEdited = true;
      return;
    }
    const form = host.querySelector("form");
    if (["metodoPago", "tipoPago"].includes(event.target.name)) {
      syncState(form);
      if (event.target.name === "metodoPago" && currentState.metodoPago !== "transferencia") currentState.comprobante = null;
      render();
      return;
    }
    if (!["domainStatus", "appWebObjetivo", "appWebRoles"].includes(event.target.name)) return;
    syncState(form);
    if (event.target.name === "domainStatus" && currentState.domainStatus !== "no_tengo") currentState.domainName = "";
    render();
  });
  return { open(project) { currentState = createWizardState(project); stepIndex = 0; countryWasEdited = false; host.hidden = false; plansGrid.classList.add("is-wizard-open"); render(); hydrateVisitorCountry(); }, close() { host.hidden = true; plansGrid.classList.remove("is-wizard-open"); } };
}
