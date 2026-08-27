import type { MetadataRoute } from "next";
import { publicReports } from "@/lib/publication/mock-reports";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date("2026-08-27"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/insights`,
      lastModified: new Date("2026-08-27"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...publicReports.map((report) => ({
      url: `${siteUrl}/insights/${report.slug}`,
      lastModified: new Date(report.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
