import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, MAIN_SITE_URL } from '@/lib/utils'

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - AI Content Tips & Guides`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - AI Content Tips & Guides`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - AI Content Tips & Guides`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  publisher: {
    '@type': 'Organization',
    name: 'TextShift',
    url: MAIN_SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${MAIN_SITE_URL}/images/logo.png`,
    },
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TextShift',
  url: MAIN_SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${MAIN_SITE_URL}/images/logo.png`,
  },
  description: 'AI content detection and humanization platform with 99.18% accuracy',
  sameAs: [],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="alternate" type="application/rss+xml" title="TextShift Blog RSS" href="/rss.xml" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-FHX0PZ88C8" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-FHX0PZ88C8');gtag('config','G-9X7KGJ9Z7W');`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
