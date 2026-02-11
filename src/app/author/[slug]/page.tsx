import { getAuthorBySlug, getPostsByAuthor, getAllAuthorSlugs } from '@/lib/sanity'
import { Post, Author } from '@/types/blog'
import BlogCard from '@/components/BlogCard'
import CTABanner from '@/components/CTABanner'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL, MAIN_SITE_URL } from '@/lib/utils'

export const dynamicParams = false

export async function generateStaticParams() {
  try {
    const slugs = await getAllAuthorSlugs()
    if (slugs && slugs.length > 0) {
      return slugs.map((s: { slug: string }) => ({ slug: s.slug }))
    }
  } catch (e) {
    console.error('Failed to fetch author slugs:', e)
  }
  return [{ slug: '__placeholder' }]
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const author: Author = await getAuthorBySlug(params.slug)
    if (!author) return { title: 'Author Not Found' }
    return {
      title: `${author.name} | ${SITE_NAME}`,
      description: author.bio || `Articles by ${author.name} on ${SITE_NAME}.`,
    }
  } catch {
    return { title: 'Author Not Found' }
  }
}

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  let author: Author | null = null
  let posts: Post[] = []

  try {
    author = await getAuthorBySlug(params.slug)
    posts = await getPostsByAuthor(params.slug)
  } catch {
    author = null
    posts = []
  }

  if (!author) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="mb-4 text-3xl font-bold text-white">Author Not Found</h1>
        <Link href="/" className="text-brand-green hover:underline">&larr; Back to Blog</Link>
      </div>
    )
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog/` },
      { '@type': 'ListItem', position: 3, name: author.name, item: `${SITE_URL}/author/${author.slug.current}/` },
    ],
  }

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: `${SITE_URL}/author/${author.slug.current}/`,
    description: author.bio || `Content author at ${SITE_NAME}`,
    worksFor: {
      '@type': 'Organization',
      name: 'TextShift',
      url: MAIN_SITE_URL,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    <div className="mx-auto max-w-6xl px-4 py-12">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-brand-muted">
          <li><Link href="/" className="hover:text-brand-green">Home</Link></li>
          <li><span>/</span></li>
          <li><Link href="/blog/" className="hover:text-brand-green">Blog</Link></li>
          <li><span>/</span></li>
          <li className="text-white">{author.name}</li>
        </ol>
      </nav>

      <div className="mb-10 flex items-start gap-5 rounded-xl border border-brand-border bg-brand-card p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-green/20 text-2xl font-bold text-brand-green">
          {author.name?.charAt(0) || 'A'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">{author.name}</h1>
          {author.bio && <p className="mt-2 text-brand-muted">{author.bio}</p>}
          <p className="mt-2 text-sm text-brand-muted">{posts.length} article{posts.length !== 1 ? 's' : ''} published</p>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <h2 className="mb-3 text-xl font-bold text-white">No articles by this author yet</h2>
          <p className="text-brand-muted">Check back soon!</p>
        </div>
      )}

      <CTABanner />
    </div>
    </>
  )
}
