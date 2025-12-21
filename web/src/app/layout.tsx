import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Epstein Files Image Gallery | Official Court Documents & Photos",
  description: "Browse 5,600+ images from the Jeffrey Epstein case files. High-resolution scans of official court documents, photos, and evidence released by the U.S. Department of Justice. Searchable, fast, and free.",
  keywords: ["Epstein files", "Epstein documents", "Jeffrey Epstein", "Epstein court documents", "Epstein photos", "Epstein evidence", "DOJ Epstein release", "Epstein case files"],
  authors: [{ name: "Public Records Archive" }],
  openGraph: {
    title: "Epstein Files Image Gallery | 5,600+ Court Documents & Photos",
    description: "The complete visual archive of Jeffrey Epstein case files. Browse high-resolution scans from official DOJ releases.",
    type: "website",
    locale: "en_US",
    siteName: "Epstein Files Gallery",
  },
  twitter: {
    card: "summary_large_image",
    title: "Epstein Files Image Gallery",
    description: "Browse 5,600+ images from the Jeffrey Epstein case files. Official court documents & photos from justice.gov.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
