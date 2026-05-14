import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/pago/", "/contratos/"],
    },
    sitemap: "https://undercodeec.com/sitemap.xml",
  };
}
