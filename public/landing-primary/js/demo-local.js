(() => {
  const introductoryCallAnchorId = "llamada_introductoria";
  const headerScheduleLink = document.querySelector("[data-contact]");
  const introductoryCallLink = document.querySelector(".offbrand-plan-action");

  if (introductoryCallLink) {
    introductoryCallLink.id = introductoryCallAnchorId;
  }

  if (headerScheduleLink && introductoryCallLink) {
    headerScheduleLink.href = `/#${introductoryCallAnchorId}`;
  }

  if (introductoryCallLink) {
    const calendarPanel = document.createElement("div");
    const calendarPanelId = "calendario-llamada-introductoria";

    calendarPanel.id = calendarPanelId;
    calendarPanel.className = "offbrand-calendar-panel";
    calendarPanel.hidden = true;
    introductoryCallLink.href = `#${introductoryCallAnchorId}`;
    introductoryCallLink.setAttribute("aria-controls", calendarPanelId);
    introductoryCallLink.setAttribute("aria-expanded", "false");
    introductoryCallLink.insertAdjacentElement("afterend", calendarPanel);

    introductoryCallLink.addEventListener("click", (event) => {
      event.preventDefault();
      const isOpening = calendarPanel.hidden;

      calendarPanel.hidden = !isOpening;
      introductoryCallLink.setAttribute("aria-expanded", String(isOpening));

      if (isOpening && !calendarPanel.childElementCount) {
        const calendar = document.createElement("iframe");
        calendar.src = "https://calendly.com/undercodeec/30min?locale=es";
        calendar.title = "Agendar reunión con Undercodeec";
        calendar.loading = "lazy";
        calendar.allow = "fullscreen";
        calendarPanel.append(calendar);
      }

      if (isOpening) {
        calendarPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  const animationRuntimeReady = () => Boolean(window.SScroll);

  const introAnimationIsActive = () =>
    animationRuntimeReady() && document.body?.style.cursor === "progress";

  const releasePage = (force = false) => {
    if (!force && introAnimationIsActive()) return false;

    document.querySelector("[preloader]")?.remove();
    document.body?.removeAttribute("data-start");
    document.body?.style.removeProperty("cursor");
    document.body?.style.removeProperty("opacity");
    document.body?.style.removeProperty("visibility");
    document.documentElement.classList.remove("anti-flicker", "lenis-stopped");
    window.SScroll?.start?.();
    window.lenis?.start?.();
    return true;
  };

  const waitForPreloader = () => {
    if (!releasePage()) window.setTimeout(waitForPreloader, 250);
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href="#"]');
    if (link) event.preventDefault();
  });

  window.addEventListener("load", () => window.setTimeout(waitForPreloader, 250));
  window.setTimeout(() => releasePage(true), 15000);

  const tools = [
    ["n8n", "/assets/img/logos/log1.webp"],
    ["Flutter", "/assets/img/logos/log2.webp"],
    ["FlutterFlow", "/assets/img/logos/log3.webp"],
    ["Google Analytics", "/assets/img/logos/log4.webp"],
    ["Stripe", "/assets/img/logos/log5.webp"],
    ["PayPal", "/assets/img/logos/log6.webp"],
    ["WordPress", "/assets/img/logos/log7.webp"],
    ["Microsoft", "/assets/img/logos/log8.webp"],
    ["React", "/assets/img/logos/log9.webp"],
    ["Google Cloud", "/assets/img/logos/log10.webp"],
    ["BH", "/assets/img/logos/log11.webp"],
    ["AI PS", "/assets/img/logos/log12.webp"],
  ];

  const toolsSection = document.querySelector("[data-client-section]");

  if (toolsSection) {
    toolsSection.classList.add("is-tools");
    toolsSection.querySelector(".eb-wrap .h-eyebrow:not(.is--clients)").textContent =
      "NUESTRAS HERRAMIENTAS";

    const toolsTag = toolsSection.querySelector("[data-client-tag]");
    if (toolsTag) {
      toolsTag.textContent = "TECNOLOGÍAS";
      if (toolsSection._clientGridData) {
        toolsSection._clientGridData.baseText = "TECNOLOGÍAS";
      }
    }

    const toolCards = [...toolsSection.querySelectorAll("[data-client-item]")];
    toolCards.forEach((card, index) => {
      const tool = tools[index];
      if (!tool) {
        card.hidden = true;
        return;
      }

      const [name, source] = tool;
      card.dataset.clientItem = name;
      const logo = document.createElement("img");
      logo.src = source;
      logo.alt = name;
      logo.className = "tool-logo";
      logo.loading = "lazy";
      card.querySelector(".home-client__grid-img")?.replaceChildren(logo);
    });
  }

  const brandLogos = [
    ["Banco Pichincha", "/landing-primary/images/ecuador-brands/banco-pichincha-logo.png"],
    ["PRONACA", "/landing-primary/images/ecuador-brands/pronaca-logo.png"],
    ["Tía", "/landing-primary/images/ecuador-brands/tia-logo.png"],
    ["Nava Cloud", "/landing-primary/images/ecuador-brands/nava-cloud-logo.png"],
    ["Arto Camello", "/landing-primary/images/ecuador-brands/arto-camello-logo.png"],
  ];

  const brandSlots = [...document.querySelectorAll(".s.is-hg .hg-grid-inner")];

  brandSlots.forEach((slot) => {
    slot.style.setProperty("background-image", "none", "important");
    slot.removeAttribute("aria-label");
  });

  brandLogos.forEach(([name, source], index) => {
    const slot = brandSlots[index];
    if (!slot) return;

    slot.style.setProperty("background-image", `url("${source}")`, "important");
    slot.setAttribute("aria-label", name);
  });

  const featuredWorks = [
    {
      name: "Undercodeec Studio",
      image: "/assets/img/FireShot%20Capture%20014%20-%20Undercodeec%20Studio%20%C2%B7%20Animaciones%20de%20Vanguardia%20-%20%5B127.0.0.1%5D.png",
      services: ["● Animación y diseño", "△ Desarrollo", "⁂ Experiencia interactiva"],
    },
    {
      name: "Luna — Apollo 11",
      image: "/landing-preview/img/demos/FireShot%20Capture%20011%20-%20%20-%20%5Bunderstudio.undercodeec.com%5D.png",
      services: ["● Diseño web", "△ Desarrollo", "⁂ WebGL, 3D"],
    },
    {
      name: "Full Stack",
      image: "/landing-preview/img/demos/FireShot%20Capture%20012%20-%20Demo%20-%20Full%20Stack%20-%20%5Bunderstudio.undercodeec.com%5D.png",
      services: ["● Producto digital", "△ Desarrollo Full Stack", "⁂ Plataforma web"],
    },
    {
      name: "Gunsmiths",
      image: "/landing-preview/img/demos/gunsmit.webp",
      services: ["● Diseño web", "△ Desarrollo", "⁂ Catálogo digital"],
    },
    {
      name: "Lucavvapes",
      image: "/landing-preview/img/demos/lucanvape.webp",
      services: ["● Diseño web", "△ Desarrollo", "⁂ Tienda online"],
    },
    {
      name: "Julio Jaramillo",
      image: "/landing-preview/img/demos/juliojaramillo.webp",
      services: ["● Identidad digital", "△ Desarrollo", "⁂ Experiencia cultural"],
    },
    {
      name: "Techco",
      image: "/landing-preview/img/demos/1.1.webp",
      services: ["● Diseño web", "△ Desarrollo", "⁂ Sitio corporativo"],
    },
    {
      name: "Cortinas & Decoraciones",
      image: "/landing-preview/img/demos/screencapture-cortinasec-2026-01-20-12_21_13.webp",
      services: ["● Diseño web", "△ Desarrollo", "⁂ Catálogo digital"],
    },
    {
      name: "Café Jungla Andina",
      image: "/landing-preview/img/demos/3.3.webp",
      services: ["● Diseño web", "△ Desarrollo", "⁂ Tienda online"],
    },
    {
      name: "Casa Gangotena",
      image: "/landing-preview/img/demos/4.4.webp",
      services: ["● Diseño web", "△ Desarrollo", "⁂ Sitio turístico"],
    },
    {
      name: "The Cave",
      image: "/landing-preview/img/demos/5.5.webp",
      services: ["● Diseño web", "△ Desarrollo", "⁂ Sitio informativo"],
    },
  ];

  const featuredWorkGrid = document.querySelector("[home-work] .hcs-grid-w");

  if (featuredWorkGrid && !featuredWorkGrid.dataset.worksReady) {
    const visibleCards = [...featuredWorkGrid.querySelectorAll(":scope > .hcs-item-w:not([display-none])")];

    if (visibleCards.length === featuredWorks.length - 1) {
      featuredWorkGrid.prepend(visibleCards[0].cloneNode(true));
    }

    [...featuredWorkGrid.querySelectorAll(":scope > .hcs-item-w:not([display-none])")]
      .slice(0, featuredWorks.length)
      .forEach((card, index) => {
        const work = featuredWorks[index];
        const image = card.querySelector(".hcs-img-inner");
        const title = card.querySelector(".hcs-info-w h3, .hcs-info-w .text-small.caps");
        const services = card.querySelectorAll(".hcs-title-w p");

        if (image) {
          image.src = work.image;
          image.alt = work.name;
          image.removeAttribute("srcset");
        }
        if (title) title.textContent = work.name;
        services.forEach((service, serviceIndex) => {
          service.textContent = work.services[serviceIndex] || "";
        });
      });

    document.querySelector("[home-work] .float-count.is-fw")?.replaceChildren(String(featuredWorks.length));
    featuredWorkGrid.dataset.worksReady = "true";
  }

  const hudSocials = document.querySelector(".hud-menu-socials");

  if (hudSocials && !hudSocials.dataset.socialsReady) {
    const socialLinks = [...hudSocials.querySelectorAll(":scope > .hud-social-w")];
    const instagram = socialLinks.find((item) => /instagram/i.test(item.textContent) || /instagram/i.test(item.querySelector("a")?.ariaLabel));
    const facebook = socialLinks[0]?.cloneNode(true);

    if (instagram && facebook) {
      const facebookLink = facebook.querySelector("a");
      facebookLink.href = "https://www.facebook.com/undercodeec";
      facebookLink.ariaLabel = "Facebook";
      facebookLink.title = "Facebook";
      facebookLink.querySelector(".hud-social-img").innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M13.9 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H8v3.1h2.8v8h3.1Z" fill="var(--main-dark)"/></svg>`;
      hudSocials.replaceChildren(facebook, instagram);
      hudSocials.dataset.socialsReady = "true";
    }
  }

  const footer = document.querySelector(".s.is-footer");
  const footerNav = footer?.querySelector(".ft-nav-w");

  if (footerNav && !footerNav.dataset.footerReady) {
    const footerColumns = [...footerNav.querySelectorAll(":scope > .ft-nav-col")];
    const connectColumn = footerColumns.find(
      (column) => column.querySelector(":scope > p")?.textContent.trim() === "Conecta",
    );
    const legalColumn = footerColumns.find((column) => column.classList.contains("is-legal"));

    const createFooterLink = (label, href, className = "") => {
      const link = document.createElement("a");
      link.href = href;
      link.className = `page-link-w w-inline-block ${className}`.trim();
      link.innerHTML = `<div class="o-hidden page-link-inner"><div class="text-small btn-txt">${label}</div><div class="btn-icon-w"><div class="text-small btn-txt">-&gt;</div></div></div><div class="link-track"><div class="link-track-fill"></div></div>`;
      return link;
    };

    if (connectColumn) {
      connectColumn.querySelector(":scope > .ft-nav-link-w")?.replaceChildren(
        createFooterLink("Facebook", "https://www.facebook.com/undercodeec"),
        createFooterLink("Instagram", "https://www.instagram.com/undercodeec/"),
      );
    }

    if (legalColumn) {
      const legalLinks = legalColumn.querySelector(":scope > .ft-nav-link-w");
      legalColumn.querySelector(":scope > p")?.replaceChildren("Legal");
      legalColumn.querySelector(":scope > p:nth-of-type(2)")?.remove();
      if (legalLinks) {
        legalLinks.replaceChildren(
          createFooterLink("Políticas de privacidad", "/politicas-playconsole/"),
          createFooterLink("Derechos de autor", "/politicas-playconsole/"),
          createFooterLink("gerencia@undercodeec.com", "mailto:gerencia@undercodeec.com"),
        );
      }
    }

    footer.querySelector(".ft-nav-col.is-ai")?.remove();
    footer.querySelector(".text-brand-footer")?.remove();
    footerNav.dataset.footerReady = "true";
  }
})();
