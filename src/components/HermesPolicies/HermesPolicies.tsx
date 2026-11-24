"use client";

import { Fragment } from "react";
import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import PrimaryPageHero from "@/components/Marketing/MarketingHero";
import ServiciosPrimaryFooter from "@/components/Servicios/ServiciosPrimaryFooter";
import { useConsent } from "@/components/Consent/ConsentManager";
import styles from "@/app/politicas-playconsole/PoliciesPage.module.css";
import localStyles from "./HermesPolicies.module.css";
import content from "./content.json";

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s]+|undercodeec@gmail\.com)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{inline(part.slice(2, -2))}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{inline(part.slice(1, -1))}</em>;
    if (part.startsWith("http")) {
      const url = new URL(part);
      return <a key={index} href={url.hostname === "undercodeec.com" ? url.pathname : part}>{part}</a>;
    }
    if (part === "undercodeec@gmail.com") return <a key={index} href={`mailto:${part}`}>{part}</a>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function Block({ text }: { text: string }) {
  const lines = text.split("\n");
  if (lines.every((line) => /^- /.test(line))) return <ul>{lines.map((line, i) => <li key={i}>{inline(line.slice(2))}</li>)}</ul>;
  if (lines.every((line) => /^\d+\. /.test(line))) return <ol>{lines.map((line, i) => <li key={i}>{inline(line.replace(/^\d+\. /, ""))}</li>)}</ol>;
  return <p>{lines.map((line, i) => <Fragment key={i}>{i > 0 && <br />}{inline(line.trim())}</Fragment>)}</p>;
}

export default function HermesPolicies({ type }: { type: "privacy" | "deletion" }) {
  const { openSettings } = useConsent();
  const isPrivacy = type === "privacy";
  const sections = isPrivacy ? content.privacy : content.deletion;
  const title = isPrivacy ? "Política de privacidad y protección de datos personales" : "Solicitud de eliminación de datos personales";
  const intro = isPrivacy ? content.privacyIntro.split("\n").slice(1).join("\n").trim() : content.deletionIntro;

  return <MainLayout>
    <div className={`${styles.page} ${localStyles.hermes}`} data-policies-page data-primary-page>
      <PrimaryHeader />
      <main className="politica-playconsole">
        <PrimaryPageHero label="Hermes / Protección de datos" lines={isPrivacy ? ["Privacidad", "clara para", "Hermes"] : ["Tus datos", "tu derecho", "a decidir"]} topMeta="Legal / Datos / Transparencia" summary={isPrivacy ? "Conoce cómo tratamos y protegemos los datos personales en Hermes." : "Conoce cómo solicitar la eliminación de tus datos personales relacionados con Hermes."} bottomMeta="Tecnología construida sobre confianza" titleId="hermes-policy-hero-title" />
        <div className={styles.preferencesAction}><button type="button" onClick={openSettings}>Preferencias de cookies <span aria-hidden="true">&#8594;</span></button></div>
        <section className="politica-section" aria-label={title}>
          <div className="politica-container"><div className="politica-content">
            <div className="politica-document-header"><p>Undercodeec / Hermes</p><h2>{title}</h2><Block text={intro} /></div>
            <nav className="politica-tags" aria-label="Índice del documento">{sections.map((section, index) => <a className="tag" key={section.title} href={`#seccion-${index + 1}`}>{section.title}</a>)}</nav>
            {sections.map((section, index) => <div key={section.title} id={`seccion-${index + 1}`} className={localStyles.section}><h2 className="politica-subtitle">{section.title}</h2>{section.blocks.map((block, i) => <Block key={i} text={block} />)}</div>)}
          </div></div>
        </section>
      </main>
      <ServiciosPrimaryFooter />
    </div>
  </MainLayout>;
}
