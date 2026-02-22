const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')

const SITE_URL = 'https://textshift.blog'

const client = createClient({
  projectId: 'mavn812v',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function generate() {
  const posts = await client.fetch(
    `*[_type == "post"] | order(publishedAt desc) {
      "slug": slug.current,
      title,
      excerpt,
      publishedAt,
      "categorySlug": category->slug.current,
      "authorSlug": author->slug.current,
      body
    }`
  )
  const categories = await client.fetch(
    `*[_type == "category"]{ "slug": slug.current }`
  )
  const authors = await client.fetch(
    `*[_type == "author"]{ "slug": slug.current }`
  )

  const now = new Date().toISOString()

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`

  for (const post of posts) {
    sitemap += `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}/</loc>
    <lastmod>${post.publishedAt || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  }

  for (const cat of categories) {
    sitemap += `
  <url>
    <loc>${SITE_URL}/category/${cat.slug}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
  }

  for (const author of authors) {
    sitemap += `
  <url>
    <loc>${SITE_URL}/author/${author.slug}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`
  }

  sitemap += '\n</urlset>'

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>TextShift Blog</title>
    <link>${SITE_URL}</link>
    <description>Expert guides on AI content detection, humanization, and writing tips.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />`

  for (const post of posts) {
    const excerpt = (post.excerpt || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const title = (post.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    rss += `
    <item>
      <title>${title}</title>
      <link>${SITE_URL}/blog/${post.slug}/</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}/</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${excerpt}</description>
    </item>`
  }

  rss += `
  </channel>
</rss>`

  const outDir = path.join(__dirname, '..', 'out')
  if (!fs.existsSync(outDir)) {
    console.log('out/ directory not found, skipping generation')
    return
  }

  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap)
  console.log('Generated sitemap.xml')

  fs.writeFileSync(path.join(outDir, 'rss.xml'), rss)
  console.log('Generated rss.xml')
}

generate().catch(console.error)
