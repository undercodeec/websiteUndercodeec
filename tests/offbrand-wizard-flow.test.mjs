import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createWizardState,
  formatBillingPhone,
  getPriceCards,
  getRoute,
  validateStep,
} from "../public/landing-primary/js/offbrand-wizard-flow.mjs";

test("requires phone and billing country selectors before payment", () => {
  const state = {
    ...createWizardState("Sitio Web"),
    tipoCliente: "consumidor_final",
    rucCedula: "1712345678",
    razonSocial: "Cliente de prueba",
    email: "cliente@example.com",
    telefonoPais: "EC",
    telefono: "0991234567",
    pais: "EC",
    callePrincipal: "Av. Amazonas",
    ciudad: "Quito",
    provincia: "Pichincha",
    metodoPago: "tarjeta",
    termsAccepted: true,
  };

  assert.equal(validateStep("Sitio Web", "billing", state), true);
  assert.equal(formatBillingPhone(state.telefono, state.telefonoPais), "+593991234567");
  state.pais = "";
  assert.equal(validateStep("Sitio Web", "billing", state), false);
});

test("requires a voucher when the selected payment method is transfer", () => {
  const state = {
    ...createWizardState("Sitio Web"),
    tipoCliente: "consumidor_final",
    rucCedula: "1712345678",
    razonSocial: "Cliente de prueba",
    email: "cliente@example.com",
    telefonoPais: "EC",
    telefono: "0991234567",
    pais: "EC",
    callePrincipal: "Av. Amazonas",
    ciudad: "Quito",
    provincia: "Pichincha",
    metodoPago: "transferencia",
    termsAccepted: true,
  };

  assert.equal(validateStep("Sitio Web", "billing", state), false);
  state.comprobante = { name: "comprobante.pdf" };
  assert.equal(validateStep("Sitio Web", "billing", state), true);
});

test("renders the country selectors in the OFF+BRAND payment wizard", async () => {
  const wizard = await readFile("public/landing-primary/js/offbrand-wizard.mjs", "utf8");

  assert.match(wizard, /name="telefonoPais"/);
  assert.match(wizard, /name="pais" required/);
  assert.match(wizard, /Datos bancarios para transferencia/);
  assert.match(wizard, /name="comprobante"/);
  assert.match(wizard, /País de facturación/);
});

test("returns the Website price, business and billing route", () => {
  const state = createWizardState("Sitio Web");

  assert.deepEqual(
    getRoute("Sitio Web", state).map(({ id }) => id),
    ["price", "business", "billing"],
  );
  assert.equal(validateStep("Sitio Web", "price", state), false);
});

test("uses the legacy mobile app discovery questions and submission values", async () => {
  const state = {
    ...createWizardState("Aplicación Móvil"),
    businessName: "Mi Tienda App",
    sector: "Comercio y Ventas",
    domainStatus: "necesito",
    appMobilePlataforma: "ambos",
    appMobileTipo: "clientes",
    appMobileFuncionalidades: ["gps", "none"],
    appMobilePublicacion: "tengo_cuentas",
    softwareNombre: "Juan Pérez",
    softwareEmail: "juan@empresa.com",
  };

  assert.deepEqual(
    getRoute("Aplicación Móvil", state).map(({ title }) => title),
    ["Identidad de la App", "Plataforma y Tecnología", "Funcionalidades Críticas", "Proyecto Configurado", "Enviar solicitud"],
  );
  assert.equal(validateStep("Aplicación Móvil", "business", state), true);
  assert.equal(validateStep("Aplicación Móvil", "platform", state), true);
  assert.equal(validateStep("Aplicación Móvil", "features", state), true);

  const wizard = await readFile("public/landing-primary/js/offbrand-wizard.mjs", "utf8");
  assert.match(wizard, /¿Tienes sitio web actualmente\?/);
  assert.match(wizard, /¿En qué dispositivos debe funcionar\?/);
  assert.match(wizard, /¿Necesitas funciones nativas del celular\?/);
  assert.match(wizard, /tengo_cuentas/);
});

test("uses the legacy web app discovery questions and submission values", async () => {
  const state = {
    ...createWizardState("Aplicación Web"),
    businessName: "Sistema de Inventarios X",
    sector: "Tecnología",
    domainStatus: "interno",
    appWebObjetivo: "otros",
    appWebObjetivoDetalle: "Gestión de franquicias",
    appWebMobile: "pwa",
    appWebDescripcion: "Los vendedores registran visitas y pedidos.",
    appWebUsuarios: "mediano",
    appWebRoles: ["admin", "auditores", "otros"],
    appWebRolesDetalle: "Supervisores regionales",
    appWebReportes: "dashboards",
    softwareNombre: "Juan Pérez",
    softwareEmail: "juan@empresa.com",
  };

  assert.deepEqual(
    getRoute("Aplicación Web", state).map(({ title }) => title),
    ["Identidad del Negocio", "Tipo de Solución", "Usuarios y Seguridad", "Proyecto Configurado", "Enviar solicitud"],
  );
  assert.equal(validateStep("Aplicación Web", "business", state), true);
  assert.equal(validateStep("Aplicación Web", "solution", state), true);
  assert.equal(validateStep("Aplicación Web", "users", state), true);

  const wizard = await readFile("public/landing-primary/js/offbrand-wizard.mjs", "utf8");
  assert.match(wizard, /¿Tienes dominio para tu aplicación\?/);
  assert.match(wizard, /¿Cuál es el propósito principal\?/);
  assert.match(wizard, /¿Qué roles de seguridad necesitas\?/);
  assert.match(wizard, /Super Administrador \(Ve todo\)/);
});

test("uses the legacy Moodle discovery questions and institutional route", async () => {
  const state = {
    ...createWizardState("Plataforma de cursos Moodle"),
    businessName: "Academia de Idiomas X",
    sector: "Academia Online",
    domainStatus: "tengo",
    moodleUso: "venta",
    moodleUsuarios: "alto",
    moodleClases: "en_vivo",
    moodleDiseno: "a_medida",
    softwareNombre: "Juan Pérez",
    softwareEmail: "juan@empresa.com",
  };

  assert.deepEqual(
    getRoute("Plataforma de cursos Moodle", state).map(({ title }) => title),
    ["Identidad Institucional", "Escala y Usuarios", "Contenido y Diseño", "Proyecto Institucional", "Enviar solicitud"],
  );
  assert.equal(validateStep("Plataforma de cursos Moodle", "business", state), true);
  assert.equal(validateStep("Plataforma de cursos Moodle", "scale", state), true);
  assert.equal(validateStep("Plataforma de cursos Moodle", "content", state), true);

  const wizard = await readFile("public/landing-primary/js/offbrand-wizard.mjs", "utf8");
  assert.match(wizard, /¿Cuántos estudiantes estimas tener activos AL MISMO TIEMPO\?/);
  assert.match(wizard, /Esta es la pregunta más importante para que no se caiga el servidor\./);
  assert.match(wizard, /¿Cómo serán las clases\?/);
  assert.match(wizard, /Diseño del Aula Virtual/);
});

test("requires a requested domain before leaving the business step", () => {
  const state = {
    ...createWizardState("Sitio Web"),
    businessName: "Mi empresa",
    sector: "Comercio y ventas",
    domainStatus: "no_tengo",
  };

  assert.equal(validateStep("Sitio Web", "business", state), false);
  state.domainName = "miempresa.com";
  assert.equal(validateStep("Sitio Web", "business", state), true);
});

test("exposes the legacy inclusions for every Website plan", () => {
  const plans = getPriceCards("Sitio Web");

  assert.deepEqual(plans.map(({ id }) => id), ["web-launch", "web-growth", "web-authority"]);
  assert.deepEqual(plans.map(({ description }) => description), [
    "Presencia Viable - Tu negocio abierto al mundo",
    "Máquina de Leads - Web estratégica y CRO",
    "Ecosistema Corporativo - Rendimiento extremo",
  ]);
  assert.deepEqual(plans[0].features, [
    "Diseño profesional con hasta 5 páginas",
    "Adaptado para celulares, tablets y computadoras",
    "Dominio .com y hosting incluido por 1 año",
    "Certificado de seguridad SSL",
    "Hasta 5 cuentas de correo corporativo",
    "Formulario de contacto y botón de WhatsApp",
    "Configuración inicial en Google",
    "1 mes de soporte técnico incluido",
  ]);
  assert.deepEqual(plans[1].features, [
    "Todo lo del Plan Lanzamiento",
    "Hasta 8 páginas con estructura para vender más",
    "Textos persuasivos que generan confianza",
    "Optimización de velocidad de carga",
    "Posicionamiento local en Google",
    "Google Analytics y Search Console conectados",
    "Integración con tus herramientas",
    "3 meses de soporte técnico incluido",
  ]);
  assert.deepEqual(plans[2].features, [
    "Todo lo del Plan Crecimiento",
    "Diseño 100% personalizado, sin plantillas",
    "Automatización con Inteligencia Artificial",
    "Sistemas avanzados a medida",
    "Seguridad reforzada",
    "Campaña en Google Ads activa durante 1 mes",
    "Seguimiento de resultados de la campaña",
    "Soporte VIP prioritario por 6 meses",
  ]);
});

test("uses the approved prices for Online Store plans", () => {
  const plans = getPriceCards("Tienda Online");

  assert.deepEqual(
    plans.map(({ id, price }) => ({ id, price })),
    [
      { id: "store-launch", price: 550 },
      { id: "store-growth", price: 850 },
      { id: "store-elite", price: 3490 },
    ],
  );
  assert.deepEqual(plans[0].features, [
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
  ]);
  assert.deepEqual(plans[1].features, [
    "Todo lo de la Tienda de Lanzamiento",
    "Filtros de búsqueda avanzados",
    "SEO técnico avanzado",
    "Recuperación de carritos abandonados",
    "Control de inventario en tiempo real",
    "Estrategia de envíos por zonas y condiciones",
    "3 meses de soporte técnico incluido",
  ]);
  assert.deepEqual(plans[2].features, [
    "Todo lo de la Tienda de Crecimiento",
    "Tecnología ultra rápida",
    "Conexión con tus sistemas empresariales",
    "Recomendador inteligente con IA",
    "Ventas internacionales",
    "Automatización de marketing",
    "Facturación electrónica integrada",
    "Seguridad reforzada y respaldos automáticos",
    "Soporte VIP prioritario por 6 meses",
  ]);
});

test("uses the approved prices for Landing Page plans", () => {
  const plans = getPriceCards("Landing Page");

  assert.deepEqual(
    plans.map(({ id, price }) => ({ id, price })),
    [
      { id: "landing-basic", price: 250 },
      { id: "landing-pro", price: 600 },
      { id: "landing-premium", price: 1500 },
    ],
  );
  assert.deepEqual(plans[0].features, [
    "Landing page de una sola sección",
    "Diseño responsive para celulares",
    "Botón flotante de WhatsApp y llamada directa",
    "Formulario de contacto o captura de prospectos",
    "Sección de beneficios del servicio o producto",
    "Dominio .com y hosting básico por 1 año",
    "5 correos corporativos",
    "SEO técnico base",
    "1 mes de soporte posterior a la entrega",
  ]);
  assert.deepEqual(plans[1].features, [
    "Todo lo de la Landing Básica",
    "Textos persuasivos para tu oferta",
    "Formulario optimizado para captar prospectos",
    "Recurso promocional o incentivo de conversión",
    "Seguimiento de campañas y anuncios con Google Analytics",
    "Integración con WhatsApp y respuestas iniciales",
  ]);
  assert.deepEqual(plans[2].features, [
    "Todo lo de la Landing Básica",
    "Palabras clave optimizadas para Google",
    "Campaña en Google Ads activa durante 1 mes",
    "Diseño personalizado con animaciones inmersivas",
  ]);
});

test("routes Moodle standard projects to payment and institutional projects to submission", () => {
  const standard = {
    ...createWizardState("Plataforma de cursos Moodle"),
    moodleUsuarios: "bajo",
    moodleClases: "asincronicas",
    moodleDiseno: "estandar",
  };
  const institutional = { ...standard, moodleUsuarios: "alto" };

  assert.equal(getRoute("Plataforma de cursos Moodle", standard).at(-1).id, "payment");
  assert.equal(getRoute("Plataforma de cursos Moodle", institutional).at(-1).id, "submit");
});
