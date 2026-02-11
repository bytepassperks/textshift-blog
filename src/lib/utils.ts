export function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function estimateReadingTime(html: string): number {
  if (!html) return 1
  const text = html.replace(/<[^>]*>/g, '')
  const words = text.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export const SITE_URL = 'https://textshift.blog'
export const MAIN_SITE_URL = 'https://textshift.org'
export const SITE_NAME = 'TextShift Blog'
export const SITE_DESCRIPTION = 'Expert guides on AI content detection, humanization, and writing tips. Learn how to create undetectable AI content with TextShift.'

export function optimizeImageUrl(url: string, width: number = 800): string {
  if (!url) return url
  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0]
    return `${base}?w=${width}&q=80&fm=webp&fit=crop&auto=format`
  }
  if (url.includes('cdn.sanity.io')) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}w=${width}&q=80&fm=webp&fit=crop`
  }
  return url
}

export function generateSrcSet(url: string): string {
  if (!url) return ''
  const widths = [400, 640, 800, 1200]
  return widths
    .map((w) => `${optimizeImageUrl(url, w)} ${w}w`)
    .join(', ')
}
