'use client'

import { useState } from 'react'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'es', label: 'Espa\u00f1ol', flag: 'ES' },
  { code: 'fr', label: 'Fran\u00e7ais', flag: 'FR' },
  { code: 'de', label: 'Deutsch', flag: 'DE' },
  { code: 'pt', label: 'Portugu\u00eas', flag: 'PT' },
  { code: 'hi', label: '\u0939\u093f\u0928\u094d\u0926\u0940', flag: 'HI' },
]

interface LanguageSwitcherProps {
  currentLang?: string
  slug?: string
  translations?: Record<string, string>
}

export default function LanguageSwitcher({ currentLang = 'en', translations }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0]

  if (!translations || Object.keys(translations).length === 0) return null

  const availableLangs = LANGUAGES.filter(
    (l) => l.code === currentLang || translations[l.code]
  )

  if (availableLangs.length <= 1) return null

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-card px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-brand-green hover:text-brand-green"
        aria-label="Switch language"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        {current.flag}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-[140px] rounded-lg border border-brand-border bg-brand-card py-1 shadow-xl">
          {availableLangs.map((lang) => (
            <a
              key={lang.code}
              href={lang.code === currentLang ? '#' : (translations[lang.code] || '#')}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2 text-sm transition-colors ${
                lang.code === currentLang
                  ? 'bg-brand-green/10 font-semibold text-brand-green'
                  : 'text-gray-300 hover:bg-brand-green/5 hover:text-brand-green'
              }`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
