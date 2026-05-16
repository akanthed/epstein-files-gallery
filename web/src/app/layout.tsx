import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://epsteinfiles.netlify.app";

// Set NEXT_PUBLIC_GA_MEASUREMENT_ID in Netlify environment variables (e.g. G-XXXXXXXXXX)
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
// Set NEXT_PUBLIC_CLARITY_PROJECT_ID in Netlify environment variables
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export const metadata: Metadata = {
  title: "Epstein Files Gallery | 5,600+ Official Court Documents & Photos",
  description:
    "Browse the complete Jeffrey Epstein case archive. 5,600+ high-resolution images from official DOJ court documents, flight logs, and photos. Free, searchable, and fully transparent.",
  keywords: [
    "Epstein files",
    "Epstein documents",
    "Jeffrey Epstein",
    "Epstein court documents",
    "Epstein photos",
    "Epstein evidence",
    "Epstein case files",
    "Epstein island",
    "Epstein list",
    "Epstein flight logs",
    "Lolita Express",
    "Ghislaine Maxwell",
    "Epstein victims",
    "DOJ Epstein release",
    "Epstein trial documents",
    "Epstein client list",
    "Epstein associates",
    "Little St. James",
  ],
  authors: [{ name: "Public Records Archive" }],
  creator: "Public Records Archive",
  publisher: "Public Records Archive",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Epstein Files Gallery | 5,600+ Court Documents & Flight Logs",
    description:
      "The complete Jeffrey Epstein case archive. Browse official DOJ documents, flight logs, and photos. Free and searchable.",
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
    description:
      "Browse the complete Jeffrey Epstein case archive. Official DOJ documents, flight logs, and photos.",
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "Legal Documents",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Epstein Files Gallery",
  alternateName: [
    "Epstein Files",
    "Epstein Documents Archive",
    "Jeffrey Epstein Files",
  ],
  description:
    "Browse 5,600+ images from the Jeffrey Epstein case files. Official court documents, flight logs, and photos from the U.S. Department of Justice.",
  url: SITE_URL,
  publisher: {
    "@type": "Organization",
    name: "Public Records Archive",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
  about: {
    "@type": "Thing",
    name: "Jeffrey Epstein case",
    description: "Legal proceedings and evidence related to Jeffrey Epstein",
  },
};

const galleryJsonLd = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  name: "Epstein Files Image Gallery",
  description: "5,600+ images from official court documents",
  numberOfItems: 5688,
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryJsonLd) }}
        />

        {/* Preconnect to external origins for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {GA_ID && (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <link rel="dns-prefetch" href="https://www.google-analytics.com" />
          </>
        )}
        {CLARITY_ID && (
          <link rel="dns-prefetch" href="https://www.clarity.ms" />
        )}
        <link
          rel="dns-prefetch"
          href="https://pagead2.googlesyndication.com"
        />

        {/* Google AdSense — must be in <head> per AdSense requirements */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7796931804918205"
          crossOrigin="anonymous"
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        {/* ── Google Analytics 4 ──────────────────────────────────────────────
            Set NEXT_PUBLIC_GA_MEASUREMENT_ID in Netlify → Site settings → Env vars
            Value format: G-XXXXXXXXXX
        ──────────────────────────────────────────────────────────────────── */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              `}
            </Script>
          </>
        )}

        {/* ── Microsoft Clarity ───────────────────────────────────────────────
            Set NEXT_PUBLIC_CLARITY_PROJECT_ID in Netlify → Site settings → Env vars
            Value format: xxxxxxxxxx (10-char project ID from clarity.microsoft.com)
        ──────────────────────────────────────────────────────────────────── */}
        {CLARITY_ID && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
