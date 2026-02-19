import { algoliasearch } from 'algoliasearch';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '6PKMU3K0JI';
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || 'a745a1b5d777b1aaf577c3d56bbd1de6';

export const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

export const BLOG_INDEX = 'blog-posts';

export interface BlogSearchResult {
  objectID: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  authorName: string;
  authorSlug: string;
  categoryTitle: string;
  categorySlug: string;
  featuredImage: string;
  featuredImageAlt: string;
  focusKeyword: string;
  keywords: string[];
  readingTime: number;
  url: string;
  language: string;
  _highlightResult?: Record<string, { value: string; matchLevel: string }>;
}
