import { MetadataRoute } from "next";
import { client } from "@/lib/sanity";

const SITE_URL = "https://textshift.blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await client.fetch(
    '*[_type == "post" && defined(slug.current)] | order(publishedAt desc) { "slug": slug.current, publishedAt, _updatedAt }'
  );

  const categories = await client.fetch(
    '*[_type == "category" && defined(slug.current)] { "slug": slug.current }'
  );

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map(
    (cat: { slug: string }) => ({
      url: `${SITE_URL}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  const postPages: MetadataRoute.Sitemap = posts.map(
    (post: { slug: string; publishedAt: string; _updatedAt: string }) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post._updatedAt || post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })
  );

  return [...staticPages, ...categoryPages, ...postPages];
}
