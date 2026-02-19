'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MAIN_SITE_URL } from '@/lib/utils'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-dark/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-brand-green">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xl font-bold text-white">TextShift</span>
          <span className="rounded bg-brand-green/10 px-2 py-0.5 text-xs font-medium text-brand-green">Blog</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm text-gray-300 transition-colors hover:text-brand-green">
            Home
          </Link>
          <Link href="/blog/" className="text-sm text-gray-300 transition-colors hover:text-brand-green">
            All Posts
          </Link>
          <a
            href={MAIN_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-300 transition-colors hover:text-brand-green"
          >
            TextShift.org
          </a>
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="flex items-center gap-2 rounded-lg border border-brand-border bg-white/5 px-3 py-1.5 text-sm text-gray-400 transition-all hover:border-brand-green/30 hover:bg-white/10"
          >
            <svg className="h-3.5 w-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search...</span>
            <kbd className="ml-1 text-[10px] rounded border border-brand-border bg-white/5 px-1.5 py-0.5 font-mono">&#8984;K</kbd>
          </button>
          <a
            href={`${MAIN_SITE_URL}/register`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand-green px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-brand-green/90"
          >
            Try Free
          </a>
        </nav>

        <button
          className="text-gray-300 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-brand-border px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-3">
            <Link href="/" className="text-sm text-gray-300 hover:text-brand-green" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link href="/blog/" className="text-sm text-gray-300 hover:text-brand-green" onClick={() => setMobileOpen(false)}>
              All Posts
            </Link>
            <a href={MAIN_SITE_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-brand-green">
              TextShift.org
            </a>
            <a
              href={`${MAIN_SITE_URL}/register`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 rounded-lg bg-brand-green px-4 py-2 text-center text-sm font-medium text-black"
            >
              Try Free
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
