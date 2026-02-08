'use client'

import { useState } from 'react'
import { Post } from '@/types/blog'
import BlogCard from '@/components/BlogCard'

const POSTS_PER_PAGE = 12

export default function PaginatedBlogList({ posts }: { posts: Post[] }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))
  const paginatedPosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, page - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages, start + maxVisible - 1)
  start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedPosts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
          {page > 1 && (
            <button
              onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="rounded-lg border border-brand-border px-3 py-2 text-sm text-gray-300 transition-colors hover:border-brand-green hover:text-brand-green"
            >
              Previous
            </button>
          )}

          {start > 1 && (
            <>
              <button
                onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="rounded-lg border border-brand-border px-3 py-2 text-sm text-gray-300 transition-colors hover:border-brand-green hover:text-brand-green"
              >
                1
              </button>
              {start > 2 && <span className="px-2 text-brand-muted">...</span>}
            </>
          )}

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                p === page
                  ? 'border-brand-green bg-brand-green/10 font-semibold text-brand-green'
                  : 'border-brand-border text-gray-300 hover:border-brand-green hover:text-brand-green'
              }`}
            >
              {p}
            </button>
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="px-2 text-brand-muted">...</span>}
              <button
                onClick={() => { setPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="rounded-lg border border-brand-border px-3 py-2 text-sm text-gray-300 transition-colors hover:border-brand-green hover:text-brand-green"
              >
                {totalPages}
              </button>
            </>
          )}

          {page < totalPages && (
            <button
              onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="rounded-lg border border-brand-border px-3 py-2 text-sm text-gray-300 transition-colors hover:border-brand-green hover:text-brand-green"
            >
              Next
            </button>
          )}
        </nav>
      )}
    </>
  )
}
