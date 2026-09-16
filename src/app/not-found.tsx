import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import NotFound from "@/components/404";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  return (
    <MainLayout>
      <div className={styles.page} data-not-found-page data-primary-page>
        <PrimaryHeader />
        <main>
          <NotFound />
        </main>
      </div>
    </MainLayout>
  );
}
