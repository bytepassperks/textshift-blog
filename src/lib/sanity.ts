import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'mavn812v'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = '2024-01-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN || '',
})

export async function getAllPosts() {
  return client.fetch(
    `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      "author": author->{name, slug, image},
      "category": category->{title, slug},
      "featuredImage": coalesce(featuredImage.asset->url, featuredImage),
      featuredImageAlt,
      metaTitle,
      metaDescription
    }`
  )
}

export async function getPostBySlug(slug: string) {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      excerpt,
      body,
      publishedAt,
      "updatedAt": _updatedAt,
      "author": author->{name, slug, bio, image, "imageUrl": image.asset->url},
      "category": category->{title, slug},
      "featuredImage": coalesce(featuredImage.asset->url, featuredImage),
      featuredImageAlt,
      metaTitle,
      metaDescription,
      focusKeyword,
      keywords,
      language,
      faqItems,
      youtubeVideos,
      "linkedTranslation": linkedTranslation->{slug, language, title}
    }`,
    { slug }
  )
}

export async function getPostsByCategory(categorySlug: string) {
  return client.fetch(
    `*[_type == "post" && category->slug.current == $categorySlug] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      "author": author->{name, slug, image},
      "category": category->{title, slug},
      "featuredImage": coalesce(featuredImage.asset->url, featuredImage),
      featuredImageAlt
    }`,
    { categorySlug }
  )
}

export async function getPostsByAuthor(authorSlug: string) {
  return client.fetch(
    `*[_type == "post" && author->slug.current == $authorSlug] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      "author": author->{name, slug, image},
      "category": category->{title, slug},
      "featuredImage": coalesce(featuredImage.asset->url, featuredImage),
      featuredImageAlt
    }`,
    { authorSlug }
  )
}

export async function getAllCategories() {
  return client.fetch(
    `*[_type == "category"] | order(title asc) {
      _id,
      title,
      slug,
      description
    }`
  )
}

export async function getCategoryBySlug(slug: string) {
  return client.fetch(
    `*[_type == "category" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description
    }`,
    { slug }
  )
}

export async function getAuthorBySlug(slug: string) {
  return client.fetch(
    `*[_type == "author" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      bio,
      "imageUrl": image.asset->url
    }`,
    { slug }
  )
}

export async function getAllAuthors() {
  return client.fetch(
    `*[_type == "author"] {
      _id,
      name,
      slug,
      bio,
      "imageUrl": image.asset->url
    }`
  )
}

export async function getAllSlugs() {
  return client.fetch(
    `*[_type == "post" && defined(slug.current)]{
      "slug": slug.current
    }`
  )
}

export async function getAllCategorySlugs() {
  return client.fetch(
    `*[_type == "category" && defined(slug.current)]{
      "slug": slug.current
    }`
  )
}

export async function getAllAuthorSlugs() {
  return client.fetch(
    `*[_type == "author" && defined(slug.current)]{
      "slug": slug.current
    }`
  )
}

export async function getRecentPosts(limit: number = 5) {
  return client.fetch(
    `*[_type == "post"] | order(publishedAt desc) [0...$limit] {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      "author": author->{name, slug},
      "category": category->{title, slug},
      "featuredImage": coalesce(featuredImage.asset->url, featuredImage),
      featuredImageAlt
    }`,
    { limit }
  )
}

export async function getApprovedComments(postId: string) {
  return client.fetch(
    `*[_type == "comment" && post._ref == $postId && approved == true] | order(createdAt asc) {
      _id,
      name,
      text,
      createdAt,
      approved,
      parentComment
    }`,
    { postId }
  )
}

export async function submitComment(data: {
  name: string
  email: string
  text: string
  postId: string
  parentCommentId?: string
}) {
  const doc = {
    _type: 'comment' as const,
    name: data.name,
    email: data.email,
    text: data.text,
    post: { _type: 'reference', _ref: data.postId },
    approved: false,
    createdAt: new Date().toISOString(),
    ...(data.parentCommentId ? { parentComment: { _type: 'reference', _ref: data.parentCommentId } } : {}),
  }
  return writeClient.create(doc)
}
