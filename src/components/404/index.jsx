import PrimaryPageHero from "@/components/Marketing/MarketingHero";

export default function NotFoundHero() {
  return (
    <PrimaryPageHero
      label="Error 404: la página solicitada no fue encontrada"
      lines={["Esta ruta", "se quedó", "sin señal"]}
      topMeta="Error 404 / Página no encontrada"
      summary="La dirección que abriste no existe, cambió de lugar o ya no está disponible. Desde aquí podemos ayudarte a retomar el camino."
      bottomMeta="Volvamos a un lugar conocido"
      index="404"
      titleId="not-found-hero-title"
      animateAcrossPage={false}
    />
  );
}
