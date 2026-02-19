'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { searchClient, BLOG_INDEX } from '@/lib/algolia';
import type { BlogSearchResult } from '@/lib/algolia';
import { formatDate } from '@/lib/utils';

function sanitizeHighlight(html: string): string {
  return html
    .replace(/<(?!\/?(mark)\b)[^>]*>/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

export default function BlogSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BlogSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await searchClient.searchSingleIndex<BlogSearchResult>({
        indexName: BLOG_INDEX,
        searchParams: {
          query: q,
          hitsPerPage: 8,
          attributesToSnippet: ['excerpt:30'],
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
        },
      });
      setResults(response.hits);
      setSelectedIndex(-1);
    } catch {
      setResults([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      setIsOpen(false);
      window.location.href = `/blog/${results[selectedIndex].slug}/`;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
      onClick={() => setIsOpen(false)}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-xl mx-4 rounded-xl border border-brand-border bg-[#111111] shadow-2xl shadow-black/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-brand-border">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyNav}
            placeholder="Search articles..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] text-gray-500 bg-white/5 border border-brand-border rounded font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {!query.trim() && !isLoading && (
            <div className="px-4 py-8 text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-brand-green/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-sm text-gray-500">Search 50 blog articles</p>
            </div>
          )}

          {isLoading && (
            <div className="px-4 py-8 text-center">
              <div className="inline-block w-5 h-5 border-2 border-brand-border border-t-brand-green rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && results.length === 0 && query.trim() && (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No articles found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <ul>
              {results.map((hit, index) => (
                <li key={hit.objectID}>
                  <Link
                    href={`/blog/${hit.slug}/`}
                    onClick={() => setIsOpen(false)}
                    className={`flex gap-3 px-4 py-3 transition-colors ${
                      index === selectedIndex
                        ? 'bg-brand-green/10'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {hit.featuredImage && (
                      <img
                        src={hit.featuredImage}
                        alt={hit.featuredImageAlt || hit.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-sm font-semibold text-white line-clamp-1 [&_mark]:bg-brand-green/30 [&_mark]:text-brand-green [&_mark]:rounded-sm [&_mark]:px-0.5"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHighlight(
                            hit._highlightResult?.title?.value || hit.title,
                          ),
                        }}
                      />
                      <p
                        className="text-xs text-gray-500 mt-0.5 line-clamp-1 [&_mark]:bg-brand-green/20 [&_mark]:text-gray-300"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHighlight(
                            hit._highlightResult?.excerpt?.value || hit.excerpt,
                          ),
                        }}
                      />
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-600">
                        {hit.categoryTitle && (
                          <span className="px-1.5 py-0.5 bg-brand-green/10 text-brand-green rounded text-[10px] font-medium">
                            {hit.categoryTitle}
                          </span>
                        )}
                        <span>{hit.readingTime} min read</span>
                        {hit.publishedAt && (
                          <span>{formatDate(hit.publishedAt)}</span>
                        )}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-4 py-2 border-t border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-gray-600">
            <span><kbd className="px-1 py-0.5 bg-white/5 rounded border border-brand-border font-mono">&uarr;&darr;</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 bg-white/5 rounded border border-brand-border font-mono">&crarr;</kbd> Select</span>
          </div>
          <a
            href="https://www.algolia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
          >
            Powered by Algolia
          </a>
        </div>
      </div>
    </div>
  );
}
