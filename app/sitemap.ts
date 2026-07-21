import type { MetadataRoute } from "next";
import { majorArcana } from "@/app/data/cards";

const BASE = "https://www.tarot-aiha.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/cards`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/reading`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
  const cardPages: MetadataRoute.Sitemap = majorArcana.map((card) => ({
    url: `${BASE}/cards/${card.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...staticPages, ...cardPages];
}
