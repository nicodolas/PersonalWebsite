import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://personalwebsite-4eb.pages.dev";
  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date("2026-01-22"),
      changeFrequency: "monthly",
      priority: 1.0,
    },
  ];
}
