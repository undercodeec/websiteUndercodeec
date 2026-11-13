import { readFileSync } from "node:fs";
import { join } from "node:path";
import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import PrimaryPageHero from "@/components/Marketing/MarketingHero";
import TrajectoryPrimaryContent from "@/components/Trajectory/TrajectoryPrimaryContent";
import ServiciosPrimaryFooter from "@/components/Servicios/ServiciosPrimaryFooter";
import styles from "./TrajectoryPage.module.css";
import "../../../public/landing-primary/css/home-team.css";

export default function NuestraTrayectoriaPage() {
  const home = readFileSync(join(process.cwd(), "public/landing-primary/index.html"), "utf8");
  const team = home.match(/<section class="s home-team"[\s\S]*?<\/section>/)?.[0];
  if (!team) throw new Error("No se encontró la sección home-team en la página raíz");
  return (
    <MainLayout>
      <div className={styles.page} data-trajectory-page data-primary-page>
        <PrimaryHeader />
        <main>
          <PrimaryPageHero
            label="Nuestra trayectoria: ideas convertidas en soluciones digitales"
            lines={["Nuestra trayectoria", "se escribe", "creando"]}
            topMeta="Historia / Equipo / Evolución"
            summary="Desde 2018 convertimos ideas en experiencias digitales, aplicaciones y software que ayudan a negocios a avanzar."
            bottomMeta="Experiencia que impulsa lo que sigue"
            titleId="trajectory-hero-title"
          />
          <TrajectoryPrimaryContent teamHtml={team} />
        </main>
        <ServiciosPrimaryFooter />
      </div>
    </MainLayout>
  );
}
