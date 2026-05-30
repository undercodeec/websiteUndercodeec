import { MetadataRoute } from "next";

export const dynamic = "force-static";

const DISALLOW = ["/admin/", "/pago/", "/contratos/"];

const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Meta-ExternalAgent",
  "Amazonbot",
  "DuckAssistBot",
  "Cohere-AI",
  "YouBot",
  "AndiBot",
];

export default function robots(): MetadataRoute.Robots {
  const aiRules = AI_BOTS.map((userAgent) => ({
    userAgent,
    allow: "/",
    disallow: DISALLOW,
  }));

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...aiRules,
    ],
    sitemap: "https://undercodeec.com/sitemap.xml",
    host: "https://undercodeec.com",
  };
}
