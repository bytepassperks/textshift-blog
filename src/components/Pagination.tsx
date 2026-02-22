import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages, start + maxVisible - 1)
  start = Math.max(1, end - maxVisible + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  function pageUrl(p: number): string {
    return p === 1 ? `${basePath}/` : `${basePath}/?page=${p}`
  }

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={pageUrl(currentPage - 1)}
          className="rounded-lg border border-brand-border px-3 py-2 text-sm text-gray-300 transition-colors hover:border-brand-green hover:text-brand-green"
        >
          Previous
        </Link>
      )}

      {start > 1 && (
        <>
          <Link
            href={pageUrl(1)}
            className="rounded-lg border border-brand-border px-3 py-2 text-sm text-gray-300 transition-colors hover:border-brand-green hover:text-brand-green"
          >
            1
          </Link>
          {start > 2 && <span className="px-2 text-brand-muted">...</span>}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={pageUrl(p)}
          className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
            p === currentPage
              ? 'border-brand-green bg-brand-green/10 font-semibold text-brand-green'
              : 'border-brand-border text-gray-300 hover:border-brand-green hover:text-brand-green'
          }`}
        >
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-brand-muted">...</span>}
          <Link
            href={pageUrl(totalPages)}
            className="rounded-lg border border-brand-border px-3 py-2 text-sm text-gray-300 transition-colors hover:border-brand-green hover:text-brand-green"
          >
            {totalPages}
          </Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link
          href={pageUrl(currentPage + 1)}
          className="rounded-lg border border-brand-border px-3 py-2 text-sm text-gray-300 transition-colors hover:border-brand-green hover:text-brand-green"
        >
          Next
        </Link>
      )}
    </nav>
  )
}
