import { MetadataRoute } from "next";
import blogData from "@/data/Blog/blog-grid.json";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://undercodeec.com";

  // Rutas estáticas principales de la aplicación
  // /noticias excluida: actualmente es placeholder noindex
  const staticRoutes = [
    "",
    "/aplicaciones-moviles",
    "/blog",
    "/contacto",
    "/ec",
    "/es",
    "/marketing-para-tu-negocio",
    "/nuestra-trayectoria",
    "/politicas-playconsole",
    "/servicios",
    "/software-para-tu-negocio",
    "/undercodeec",
  ];

  const staticSitemaps = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}/`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Rutas dinámicas basadas en los posts del blog
  const blogSitemaps = blogData.map((post) => {
    let parsedDate = new Date();

    // Preferir el campo ISO datePublished/dateModified si existe
    const iso = post.dateModified || post.datePublished;
    if (iso) {
      const testDate = new Date(iso);
      if (!isNaN(testDate.getTime())) {
        parsedDate = testDate;
      }
    } else if (post.date) {
      const dateStr = post.date
        .replace(/ene/i, "Jan")
        .replace(/feb/i, "Feb")
        .replace(/mar/i, "Mar")
        .replace(/abr/i, "Apr")
        .replace(/may/i, "May")
        .replace(/jun/i, "Jun")
        .replace(/jul/i, "Jul")
        .replace(/ago/i, "Aug")
        .replace(/sep/i, "Sep")
        .replace(/oct/i, "Oct")
        .replace(/nov/i, "Nov")
        .replace(/dic/i, "Dec");

      const testDate = new Date(`${dateStr} 2025`);
      if (!isNaN(testDate.getTime())) {
        parsedDate = testDate;
      }
    }

    return {
      url: `${baseUrl}/blog/${post.slug}/`,
      lastModified: parsedDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  return [...staticSitemaps, ...blogSitemaps];
}
