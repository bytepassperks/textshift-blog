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
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search articles..."
          className="w-full pl-10 pr-16 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-shadow hover:shadow-md"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </div>

      {isOpen && (query.trim() || isLoading) && (
        <div className="absolute z-50 top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[480px] overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-6 text-center text-gray-400">
              <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && results.length === 0 && query.trim() && (
            <div className="px-4 py-6 text-center text-gray-500">
              No articles found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <ul className="divide-y divide-gray-50">
              {results.map((hit) => (
                <li key={hit.objectID}>
                  <Link
                    href={`/blog/${hit.slug}/`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="flex gap-4 px-4 py-3 hover:bg-emerald-50 transition-colors"
                  >
                    {hit.featuredImage && (
                      <img
                        src={hit.featuredImage}
                        alt={hit.featuredImageAlt || hit.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-sm font-semibold text-gray-900 line-clamp-1"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHighlight(
                            hit._highlightResult?.title?.value || hit.title,
                          ),
                        }}
                      />
                      <p
                        className="text-xs text-gray-500 mt-0.5 line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHighlight(
                            hit._highlightResult?.excerpt?.value || hit.excerpt,
                          ),
                        }}
                      />
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        {hit.categoryTitle && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded">
                            {hit.categoryTitle}
                          </span>
                        )}
                        <span>{hit.readingTime} min read</span>
                        {hit.publishedAt && (
                          <span>{formatDate(hit.publishedAt)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {results.length > 0
                ? `${results.length} result${results.length !== 1 ? 's' : ''}`
                : ''}
            </span>
            <a
              href="https://www.algolia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-300 hover:text-gray-400 flex items-center gap-1"
            >
              Search by Algolia
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
