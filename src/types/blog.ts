export interface FAQItem {
  question: string
  answer: string
}

export interface YouTubeVideo {
  videoId: string
  title: string
  caption?: string
}

export interface Post {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  body?: string
  publishedAt: string
  author: Author
  category: Category
  featuredImage: string | null
  featuredImageAlt: string
  metaTitle?: string
  metaDescription?: string
  focusKeyword?: string
  keywords?: string[]
  language?: string
  faqItems?: FAQItem[]
  youtubeVideos?: YouTubeVideo[]
  linkedTranslation?: {
    slug: { current: string }
    language: string
    title: string
  }
}

export interface Author {
  _id?: string
  name: string
  slug: { current: string }
  bio?: string
  image?: unknown
  imageUrl?: string
}

export interface Category {
  _id?: string
  title: string
  slug: { current: string }
  description?: string
}
