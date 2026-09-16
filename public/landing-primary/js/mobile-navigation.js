(() => {
  const mountMobileNavigation = () => {
    const menuLinks = document.querySelector(".hud-menu-link-w");
    if (!menuLinks || menuLinks.querySelector(".offbrand-mobile-navigation")) return;

    const navigation = document.createElement("nav");
    navigation.className = "offbrand-mobile-navigation";
    navigation.setAttribute("aria-label", "Navegación principal");
    navigation.innerHTML = `
      <div class="o-hidden"><div class="o-hidden menu-l2"><a href="/" class="hud-menu-link w-inline-block"><div class="o-hidden page-link-inner"><div class="text-small btn-txt">Inicio</div><div class="btn-icon-w"><div class="text-small btn-txt">-&gt;</div></div></div><div class="link-track"><div class="link-track-fill"></div></div></a></div></div>
      <div class="o-hidden"><div class="o-hidden menu-l2"><a href="/servicios" class="hud-menu-link w-inline-block"><div class="o-hidden page-link-inner"><div class="text-small btn-txt">Servicios</div><div class="btn-icon-w"><div class="text-small btn-txt">-&gt;</div></div></div><div class="link-track"><div class="link-track-fill"></div></div></a></div></div>
      <div class="offbrand-mobile-services-group">
        <div class="o-hidden"><div class="o-hidden menu-l2"><a href="/aplicaciones-moviles" class="hud-menu-link w-inline-block"><div class="o-hidden page-link-inner"><div class="text-small btn-txt">Aplicaciones Móviles</div><div class="btn-icon-w"><div class="text-small btn-txt">-&gt;</div></div></div><div class="link-track"><div class="link-track-fill"></div></div></a></div></div>
        <div class="o-hidden"><div class="o-hidden menu-l2"><a href="/marketing-para-tu-negocio" class="hud-menu-link w-inline-block"><div class="o-hidden page-link-inner"><div class="text-small btn-txt">Marketing para tu negocio</div><div class="btn-icon-w"><div class="text-small btn-txt">-&gt;</div></div></div><div class="link-track"><div class="link-track-fill"></div></div></a></div></div>
        <div class="o-hidden"><div class="o-hidden menu-l2"><a href="/software-para-tu-negocio" class="hud-menu-link w-inline-block"><div class="o-hidden page-link-inner"><div class="text-small btn-txt">Software para tu negocio</div><div class="btn-icon-w"><div class="text-small btn-txt">-&gt;</div></div></div><div class="link-track"><div class="link-track-fill"></div></div></a></div></div>
      </div>
      <div class="o-hidden"><div class="o-hidden menu-l2"><a href="/#reserva_agenda" class="hud-menu-link w-inline-block"><div class="o-hidden page-link-inner"><div class="text-small btn-txt">Agendar Reunión</div><div class="btn-icon-w"><div class="text-small btn-txt">-&gt;</div></div></div><div class="link-track"><div class="link-track-fill"></div></div></a></div></div>
    `;
    menuLinks.prepend(navigation);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountMobileNavigation, { once: true });
  } else {
    mountMobileNavigation();
  }
})();
