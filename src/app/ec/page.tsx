import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import LandingEcuador from "@/components/LandingEcuador/LandingEcuador";
import ServiciosPrimaryFooter from "@/components/Servicios/ServiciosPrimaryFooter";
import styles from "./EcuadorPage.module.css";

export default function EcuadorPage() {
  return (
    <MainLayout>
      <div className={styles.page} data-ec-page data-primary-page>
        <PrimaryHeader />
        <LandingEcuador />
        <ServiciosPrimaryFooter />
      </div>
    </MainLayout>
  );
}
