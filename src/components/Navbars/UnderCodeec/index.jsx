"use client";

import Link from "next/link";
import ReactGA from "react-ga4";
import UnderCodeecChannelCanvas from "./UnderCodeecChannelCanvas";
import styles from "./UnderCodeecPrimaryContent.module.css";

const channels = [
  {
    index: "01",
    label: "Sitio y proyectos",
    description: "Conoce nuestra experiencia, servicios y proyectos digitales.",
    href: "/",
    event: "click_navegar_web",
    visual: "website",
    external: false,
  },
  {
    index: "02",
    label: "WhatsApp",
    description: "Conversemos directamente sobre tu idea o necesidad.",
    href: "https://wa.me/593999739534?text=Hola%20Undercodeec%2C%20quiero%20conversar%20sobre%20un%20proyecto.",
    event: "click_whatsapp",
    visual: "whatsapp",
    external: true,
  },
  {
    index: "03",
    label: "Instagram",
    description: "Procesos, ideas y una mirada cercana a nuestro trabajo.",
    href: "https://www.instagram.com/undercodeec/",
    event: "click_instagram",
    visual: "instagram",
    external: true,
  },
  {
    index: "04",
    label: "Facebook",
    description: "Novedades, proyectos y contenido para negocios digitales.",
    href: "https://www.facebook.com/undercodeec",
    event: "click_facebook",
    visual: "facebook",
    external: true,
  },
];

function trackChannel(channel) {
  ReactGA.event({
    category: "Interacción",
    action: channel.event,
    label: channel.label,
  });

  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("trackCustom", "ClickCanalUndercodeec", {
      channel: channel.label,
      location: "UnderCodeec",
    });
  }
}

export default function UnderCodeec() {
  return (
    <div className={styles.content}>
      <section className={styles.directory} aria-labelledby="undercodeec-directory-title">
        <header className={styles.sectionHeader}>
          <p className={styles.sectionMeta}>Conecta / 01</p>
          <h2 id="undercodeec-directory-title">Elige cómo quieres encontrarnos.</h2>
          <p className={styles.sectionIntro}>
            Explora nuestro trabajo, escríbenos directamente o acompaña lo que compartimos en nuestros canales.
          </p>
        </header>

        <div className={styles.channelGrid}>
          {channels.map((channel) => {
            const inner = (
              <>
                <div className={styles.cardTop}>
                  <span>{channel.index}</span>
                  <span aria-hidden="true">↗</span>
                </div>
                <UnderCodeecChannelCanvas type={channel.visual} />
                <div>
                  <h3>{channel.label}</h3>
                  <p>{channel.description}</p>
                </div>
              </>
            );

            return channel.external ? (
              <a
                className={styles.channelCard}
                href={channel.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackChannel(channel)}
                key={channel.label}
              >
                {inner}
              </a>
            ) : (
              <Link className={styles.channelCard} href={channel.href} onClick={() => trackChannel(channel)} key={channel.label}>
                {inner}
              </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
}
