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
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
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
          className="w-full pl-11 pr-20 py-3 rounded-xl border border-brand-border bg-brand-card text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green/50 text-sm transition-all"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-gray-500 bg-brand-dark rounded border border-brand-border font-mono">
          <span>&#8984;</span>K
        </kbd>
      </div>

      {isOpen && (query.trim() || isLoading) && (
        <div className="absolute z-50 top-full mt-2 w-full bg-brand-card rounded-xl border border-brand-border shadow-2xl shadow-black/50 max-h-[480px] overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-6 text-center">
              <div className="inline-block w-5 h-5 border-2 border-brand-border border-t-brand-green rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && results.length === 0 && query.trim() && (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              No articles found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <ul className="divide-y divide-brand-border">
              {results.map((hit) => (
                <li key={hit.objectID}>
                  <Link
                    href={`/blog/${hit.slug}/`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    {hit.featuredImage && (
                      <img
                        src={hit.featuredImage}
                        alt={hit.featuredImageAlt || hit.title}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
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
                        className="text-xs text-gray-500 mt-0.5 line-clamp-2 [&_mark]:bg-brand-green/20 [&_mark]:text-gray-300"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHighlight(
                            hit._highlightResult?.excerpt?.value || hit.excerpt,
                          ),
                        }}
                      />
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
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
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="px-4 py-2 border-t border-brand-border flex items-center justify-between">
            <span className="text-[10px] text-gray-600">
              {results.length > 0
                ? `${results.length} result${results.length !== 1 ? 's' : ''}`
                : ''}
            </span>
            <a
              href="https://www.algolia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-600 hover:text-gray-400 flex items-center gap-1 transition-colors"
            >
              Search by Algolia
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
