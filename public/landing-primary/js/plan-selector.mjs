import { createOffbrandWizard } from "./offbrand-wizard.mjs";

const PLAN_PROJECT_TYPES = new Set([
  "Sitio Web", "Desarrollo de Software", "Tienda Online", "Landing Page",
  "Aplicación Web", "Aplicación Móvil", "Plataforma de cursos Moodle",
]);

export function getPlanProjectFromSearch(search) {
  const project = new URLSearchParams(search).get("project") ?? "";
  return PLAN_PROJECT_TYPES.has(project) ? project : "";
}

function initializePlanSelector() {
  const section = document.querySelector("[data-demo-plans-section]");
  const optionGroup = section?.querySelector(".offbrand-project-options");
  const options = [...(section?.querySelectorAll(".offbrand-project-option") ?? [])];
  const plansGrid = section?.querySelector(".offbrand-plans-grid");
  if (!optionGroup || !plansGrid || !options.length) return;

  optionGroup.setAttribute("role", "group");
  optionGroup.setAttribute("aria-label", "Tipo de proyecto");
  options.forEach((option) => {
    const project = option.textContent.trim().replace(/^\d+\s*/, "");
    option.dataset.planProject = project === "Plataforma Moodle" ? "Plataforma de cursos Moodle" : project;
    option.setAttribute("aria-pressed", "false");
  });

  const status = document.createElement("p");
  status.className = "offbrand-plan-selection-status text-mini";
  status.setAttribute("aria-live", "polite");
  status.textContent = "Selecciona un tipo de proyecto para continuar.";
  optionGroup.insertAdjacentElement("afterend", status);

  const wizard = createOffbrandWizard({
    plansGrid,
    onClose: () => {
      options.forEach((option) => option.setAttribute("aria-pressed", "false"));
      status.textContent = "Selecciona un tipo de proyecto para continuar.";
      options[0]?.focus();
    },
  });

  const selectProject = (project) => {
    if (!PLAN_PROJECT_TYPES.has(project)) return;
    options.forEach((option) => option.setAttribute("aria-pressed", String(option.dataset.planProject === project)));
    status.textContent = `${project} seleccionado. Completa el configurador.`;
    wizard.open(project);
  };
  options.forEach((option) => option.addEventListener("click", (event) => {
    event.preventDefault();
    selectProject(option.dataset.planProject);
  }));
  section.addEventListener("keydown", (event) => {
    if (!event.target.matches(".offbrand-project-option")) return;
    if (event.key === " " || event.key === "Spacebar") { event.preventDefault(); event.target.click(); return; }
    const currentIndex = options.indexOf(event.target);
    const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
    if (!direction || currentIndex < 0) return;
    event.preventDefault();
    options[(currentIndex + direction + options.length) % options.length].focus();
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializePlanSelector, { once: true });
  else initializePlanSelector();
}
