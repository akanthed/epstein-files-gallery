import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Update this to your Netlify domain
const SITE_URL = "https://epsteinfiles.netlify.app";

export const metadata: Metadata = {
  title: "Epstein Files Gallery | 5,600+ Official Court Documents & Photos",
  description: "Browse the complete Jeffrey Epstein case archive. 5,600+ high-resolution images from official DOJ court documents, flight logs, and photos. Free, searchable, and fully transparent.",
  keywords: [
    "Epstein files", "Epstein documents", "Jeffrey Epstein", "Epstein court documents",
    "Epstein photos", "Epstein evidence", "Epstein case files", "Epstein island",
    "Epstein list", "Epstein flight logs", "Lolita Express", "Ghislaine Maxwell",
    "Epstein victims", "DOJ Epstein release", "Epstein trial documents",
    "Epstein client list", "Epstein associates", "Little St. James"
  ],
  authors: [{ name: "Public Records Archive" }],
  creator: "Public Records Archive",
  publisher: "Public Records Archive",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Epstein Files Gallery | 5,600+ Court Documents & Flight Logs",
    description: "The complete Jeffrey Epstein case archive. Browse official DOJ documents, flight logs, and photos. Free and searchable.",
    type: "website",
    locale: "en_US",
    siteName: "Epstein Files Gallery",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Epstein Files Gallery - Official Court Documents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Epstein Files Gallery | 5,600+ Court Documents",
    description: "Browse the complete Jeffrey Epstein case archive. Official DOJ documents, flight logs, and photos.",
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      maxImagePreview: "large",
      maxSnippet: -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: "google665d90b0f3325bee",
  },
  category: "Legal Documents",
};

// JSON-LD Structured Data for Rich Snippets
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Epstein Files Gallery",
  "alternateName": ["Epstein Files", "Epstein Documents Archive", "Jeffrey Epstein Files"],
  "description": "Browse 5,600+ images from the Jeffrey Epstein case files. Official court documents, flight logs, and photos from the U.S. Department of Justice.",
  "url": SITE_URL,
  "publisher": {
    "@type": "Organization",
    "name": "Public Records Archive",
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  },
  "about": {
    "@type": "Thing",
    "name": "Jeffrey Epstein case",
    "description": "Legal proceedings and evidence related to Jeffrey Epstein"
  }
};

// Additional structured data for image gallery
const galleryJsonLd = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Epstein Files Image Gallery",
  "description": "5,600+ images from official court documents",
  "numberOfItems": 5688,
  "url": SITE_URL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryJsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7796931804918205"
             crossOrigin="anonymous"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
