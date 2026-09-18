(() => {
  const reservationAnchorId = "reserva_agenda";
  const consentStorageKey = "undercodeec_consent_v1";
  const consentPolicyVersion = "2026-09-17";
  const calendlyOrigin = "https://calendly.com";
  const headerScheduleLink = document.querySelector("[data-contact]");
  const introductoryCallLink = document.querySelector(".offbrand-plan-action");
  const reservationSection = introductoryCallLink?.closest(".offbrand-plan-column");

  const measurementConsentIsGranted = () => {
    try {
      const preferences = JSON.parse(window.localStorage.getItem(consentStorageKey) || "null");
      return preferences?.policyVersion === consentPolicyVersion
        && (preferences.analytics === true || preferences.advertising === true);
    } catch {
      return false;
    }
  };

  const pushAnalyticsEvent = (event, parameters = {}) => {
    if (!measurementConsentIsGranted()) return false;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...parameters });
    return true;
  };

  if (reservationSection) {
    reservationSection.id = reservationAnchorId;
  }

  if (headerScheduleLink && reservationSection) {
    headerScheduleLink.href = `/#${reservationAnchorId}`;
  }

  if (introductoryCallLink) {
    const calendarPanel = document.createElement("div");
    const calendarSurface = document.createElement("div");
    const calendarCloseButton = document.createElement("button");
    const calendarPanelId = "calendario-llamada-introductoria";

    calendarPanel.id = calendarPanelId;
    calendarPanel.className = "offbrand-calendar-panel";
    calendarPanel.setAttribute("data-lenis-prevent", "");
    calendarPanel.setAttribute("data-lenis-prevent-touch", "");
    calendarPanel.setAttribute("data-lenis-prevent-wheel", "");
    calendarPanel.setAttribute("role", "dialog");
    calendarPanel.setAttribute("aria-modal", "true");
    calendarPanel.setAttribute("aria-label", "Calendario para agendar una reunión");
    calendarPanel.hidden = true;
    calendarSurface.className = "offbrand-calendar-surface";
    calendarSurface.setAttribute("data-lenis-prevent", "");
    calendarSurface.setAttribute("data-lenis-prevent-touch", "");
    calendarSurface.setAttribute("data-lenis-prevent-wheel", "");
    calendarCloseButton.type = "button";
    calendarCloseButton.className = "offbrand-calendar-close";
    calendarCloseButton.setAttribute("aria-label", "Cerrar calendario");
    calendarCloseButton.textContent = "Cerrar ×";
    calendarSurface.append(calendarCloseButton);
    calendarPanel.append(calendarSurface);
    introductoryCallLink.href = `#${reservationAnchorId}`;
    introductoryCallLink.setAttribute("aria-controls", calendarPanelId);
    introductoryCallLink.setAttribute("aria-expanded", "false");
    document.body.append(calendarPanel);

    let calendarReservationRecorded = false;
    const recordCalendlyReservation = (event) => {
      if (event.origin !== calendlyOrigin || event.data?.event !== "calendly.event_scheduled") return;
      if (calendarReservationRecorded) return;

      calendarReservationRecorded = true;
      pushAnalyticsEvent("schedule_complete", {
        booking_type: "introductory_call",
        page_path: window.location.pathname || "/",
      });
    };
    window.addEventListener("message", recordCalendlyReservation);

    const closeCalendar = () => {
      if (calendarPanel.hidden) return;
      calendarPanel.hidden = true;
      introductoryCallLink.setAttribute("aria-expanded", "false");
      introductoryCallLink.focus({ preventScroll: true });
    };

    calendarCloseButton.addEventListener("click", closeCalendar);
    calendarPanel.addEventListener("click", (event) => {
      if (event.target === calendarPanel) closeCalendar();
    });
    calendarPanel.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeCalendar();
    });

    introductoryCallLink.addEventListener("click", (event) => {
      event.preventDefault();
      const isOpening = calendarPanel.hidden;

      if (isOpening && !calendarSurface.querySelector("iframe")) {
        const calendar = document.createElement("iframe");
        const calendlyUrl = new URL("https://calendly.com/undercodeec/30min");
        calendlyUrl.searchParams.set("locale", "es");
        calendlyUrl.searchParams.set("hide_gdpr_banner", "1");
        calendlyUrl.searchParams.set("embed_type", "Inline");
        calendlyUrl.searchParams.set("embed_domain", window.location.host);
        calendar.src = calendlyUrl.toString();
        calendar.title = "Agendar reunión con Undercodeec";
        calendar.loading = "lazy";
        calendar.allow = "fullscreen";
        calendar.setAttribute("scrolling", "yes");
        calendar.tabIndex = 0;
        calendarSurface.append(calendar);
      }

      if (isOpening) {
        calendarPanel.hidden = false;
        introductoryCallLink.setAttribute("aria-expanded", "true");
        pushAnalyticsEvent("schedule_open", {
          booking_type: "introductory_call",
          page_path: window.location.pathname || "/",
        });
        window.requestAnimationFrame(() => calendarCloseButton.focus());
      } else {
        closeCalendar();
      }
    });

    const scrollToReservation = () => {
      if (window.location.hash !== `#${reservationAnchorId}`) return;
      reservationSection?.scrollIntoView({ behavior: "auto", block: "center" });
    };

    window.addEventListener("hashchange", scrollToReservation);
    window.requestAnimationFrame(scrollToReservation);
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

  const favicon = (domain) =>
    `https://www.google.com/s2/favicons?sz=256&domain_url=${encodeURIComponent(`https://${domain}`)}`;

  const brandLogos = [
    ["Banco Pichincha", "/landing-primary/images/ecuador-brands/banco-pichincha-logo.png"],
    ["PRONACA", "/landing-primary/images/ecuador-brands/pronaca-logo.png"],
    ["Tía", "/landing-primary/images/ecuador-brands/tia-logo.png"],
    ["Nava Cloud", "/landing-primary/images/ecuador-brands/nava-cloud-logo.png"],
    ["Arto Camello", "/landing-primary/images/ecuador-brands/arto-camello-logo.png"],
    ["The Cave", "/landing-primary/images/ecuador-brands/the-cave.svg"],
    ["Gimnasio Taurus", "/landing-primary/images/ecuador-brands/gimnasio-taurus.svg"],
    ["Casa Gangotena", "/landing-primary/images/ecuador-brands/casa-gangotena.svg"],
    ["Glogik Logistics", "/landing-primary/images/ecuador-brands/glogik-logistics.webp"],
    ["Banco Guayaquil", favicon("bancoguayaquil.com")],
    ["Banco del Pacífico", favicon("bancodelpacifico.com")],
    ["Produbanco", favicon("produbanco.com")],
    ["Cooperativa JEP", favicon("jep.coop")],
    ["Supermaxi", "/landing-primary/images/ecuador-brands/supermaxi.jpg"],
    ["Mi Comisariato", favicon("elrosado.com")],
    ["Kywi", favicon("kywi.com.ec")],
    ["Pacari", favicon("pacari.com")],
    ["Toni", favicon("toni.com.ec")],
    ["La Fabril", favicon("lafabril.com.ec")],
    ["Nirsa", favicon("nirsa.com")],
    ["Moderna Alimentos", favicon("modernaalimentos.com.ec")],
    ["Sweet & Coffee", favicon("sweetandcoffee.com")],
    ["Grupo Nobis", favicon("nobis.com.ec")],
    ["Difare", favicon("difare.com.ec")],
    ["Fybeca", favicon("fybeca.com")],
    ["SanaSana", favicon("sanasana.com.ec")],
    ["Netlife", favicon("netlife.ec")],
    ["CNT", favicon("cnt.gob.ec")],
    ["Xtrim", favicon("xtrim.com.ec")],
    ["Tipti", favicon("tipti.market")],
    ["Kushki", favicon("kushki.com")],
    ["Payphone", favicon("payphonetodo.com")],
    ["YaEstá", favicon("yaesta.com")],
    ["Banco Internacional", favicon("bancointernacional.com.ec")],
    ["Seguros Equinoccial", favicon("equinoccial.com")],
    ["Novacero", favicon("novacero.com")],
    ["Adelca", favicon("adelca.com")],
    ["Plastigama", favicon("plastigama.com")],
    ["Cervecería Nacional", favicon("cervecerianacional.ec")],
    ["Zhumir", favicon("zhumir.com")],
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
      href: "https://understudio.undercodeec.com/",
      services: ["● Animación y diseño", "△ Desarrollo", "⁂ Experiencia interactiva"],
    },
    {
      name: "Luna — Apollo 11",
      image: "/landing-preview/img/demos/FireShot%20Capture%20011%20-%20%20-%20%5Bunderstudio.undercodeec.com%5D.png",
      href: "https://understudio.undercodeec.com/demo-moon/",
      services: ["● Diseño web", "△ Desarrollo", "⁂ WebGL, 3D"],
    },
    {
      name: "Full Stack",
      image: "/landing-preview/img/demos/FireShot%20Capture%20012%20-%20Demo%20-%20Full%20Stack%20-%20%5Bunderstudio.undercodeec.com%5D.png",
      href: "https://understudio.undercodeec.com/stack-demo",
      services: ["● Producto digital", "△ Desarrollo Full Stack", "⁂ Plataforma web"],
    },
    {
      name: "Gunsmiths",
      image: "/landing-preview/img/demos/gunsmit.webp",
      href: "https://gunsmithsec.com/",
      services: ["● Diseño web", "△ Desarrollo", "⁂ Catálogo digital"],
    },
    {
      name: "Glogik Logistics",
      image: "/landing-preview/img/demos/logik.webp",
      href: "https://glogiklogistics.com/",
      services: ["● Diseño web", "△ Desarrollo", "⁂ Tienda online"],
    },
    {
      name: "Julio Jaramillo",
      image: "/landing-preview/img/demos/juliojaramillo.webp",
      href: "https://juliojaramilloec.com/",
      services: ["● Identidad digital", "△ Desarrollo", "⁂ Experiencia cultural"],
    },
    {
      name: "Nava",
      image: "/landing-preview/img/demos/image.png",
      href: "https://navacloud.app/",
      services: ["● Diseño web", "△ Desarrollo", "⁂ Sitio corporativo"],
    },
    {
      name: "Casa Gangotena",
      image: "/landing-preview/img/demos/4.4.webp",
      href: "https://www.casagangotena.com/es/",
      services: ["● Diseño web", "△ Desarrollo", "⁂ Sitio turístico"],
    },
    {
      name: "Café Jungla Andina",
      image: "/landing-preview/img/demos/3.3.webp",
      href: "https://junglaandina.com/",
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
      href: "https://thecave.ec/",
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
        if (work.href) {
          card.href = work.href;
          card.target = "_blank";
          card.rel = "noopener noreferrer";
        }
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
