import Image from "next/image";
import Link from "next/link";
import demos from "@/data/Preview/demos.json";
import styles from "./demos.module.css";

export const metadata = {
  title: "Demos | Undercodeec",
  description: "Una selección de sitios web y experiencias digitales creadas por Undercodeec.",
};

export default function DemosPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="demos-title">
        <div className={`${styles.ring} ${styles.ringLarge}`} aria-hidden="true" />
        <div className={`${styles.ring} ${styles.ringSmall}`} aria-hidden="true" />
        <div className={styles.sphere} aria-hidden="true" />

        <div className={styles.container}>
          <nav className={styles.nav} aria-label="Navegación de demos">
            <Link className={styles.brand} href="/">
              UNDERCODEEC.
            </Link>
            <Link className={styles.ghostLink} href="#portfolio">
              VER PROYECTOS <span aria-hidden="true">↓</span>
            </Link>
          </nav>

          <div className={styles.heroContent}>
            <p className={styles.label}>01 — ARCHIVO DIGITAL</p>
            <h1 id="demos-title" className={styles.display}>
              NUESTROS<br />
              DEMOS
            </h1>
            <p className={styles.heroCopy}>
              Experiencias digitales diseñadas para dar a cada negocio una presencia tan clara como memorable.
            </p>
          </div>
        </div>

        <a className={styles.scrollIndicator} href="#portfolio">
          SCROLL <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className={styles.intro} aria-labelledby="intro-title">
        <div className={styles.container}>
          <div className={styles.introGrid}>
            <div>
              <p className={styles.label}>02 — NUESTRO ENFOQUE</p>
              <Link className={styles.ghostLink} href="/contacto">
                HABLEMOS <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div>
              <h2 id="intro-title" className={styles.subheading}>
                Diseñamos para que las ideas encuentren su mejor forma digital.
              </h2>
              <p className={styles.bodyCopy}>
                Cada proyecto reúne estrategia, identidad y tecnología en una experiencia útil, veloz y cuidadosamente construida.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="portfolio" className={styles.portfolio} aria-labelledby="portfolio-title">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className={styles.label}>03 — PORTAFOLIO</p>
            <h2 id="portfolio-title" className={styles.heading}>PORTAFOLIO SELECCIONADO</h2>
            <p className={styles.projectCount}>{demos.length} PROYECTOS</p>
          </div>

          <div className={styles.projectGrid}>
            {demos.map((demo, index) => (
              <article className={styles.projectCard} key={demo.link}>
                <a
                  className={styles.projectLink}
                  href={demo.link}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Visitar ${demo.type}`}
                >
                  <div className={styles.projectMeta}>
                    <span>0{index + 1}</span>
                    <span>{demo.title}</span>
                  </div>
                  <h3>{demo.type}</h3>
                  <div className={styles.imageFrame}>
                    <Image
                      src={demo.img}
                      alt={demo.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                    />
                  </div>
                  <span className={styles.visitLink}>VISITAR SITIO <span aria-hidden="true">↗</span></span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <p className={styles.label}>UNDERCODEEC — QUITO, ECUADOR</p>
          <Link className={styles.ghostLink} href="/contacto">
            INICIAR UN PROYECTO <span aria-hidden="true">→</span>
          </Link>
        </div>
      </footer>
    </main>
  );
}
