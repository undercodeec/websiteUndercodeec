import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import PrimaryPageHero from "@/components/Marketing/MarketingHero";
import BlogGrid from "@/components/Blog/BlogGrid";
import ServiciosPrimaryFooter from "@/components/Servicios/ServiciosPrimaryFooter";
import styles from "./BlogPage.module.css";

export default function BlogPage() {
  return (
    <MainLayout>
      <div className={styles.page} data-blog-page data-primary-page>
        <PrimaryHeader />
        <main className="blog-page style-5">
          <PrimaryPageHero
            label="Blog Undercodeec sobre tecnología, inteligencia artificial y crecimiento digital"
            lines={["Ideas para", "entender lo", "que viene"]}
            topMeta="Ideas / Tecnología / Negocios"
            summary="Análisis, guías y perspectivas para tomar mejores decisiones sobre software, inteligencia artificial y crecimiento digital."
            bottomMeta="Conocimiento para decidir mejor"
            titleId="blog-hero-title"
          />
          <BlogGrid />
        </main>
        <ServiciosPrimaryFooter />
      </div>
    </MainLayout>
  );
}
