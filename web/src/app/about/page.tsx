import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Epstein Files Gallery",
  description:
    "About Epstein Files Gallery — a public-interest archive of 5,600+ official court documents, photos, and flight logs from the Jeffrey Epstein case.",
  alternates: {
    canonical: "https://epsteinfiles.netlify.app/about/",
  },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <header className="border-b border-white/10 px-6 py-4">
        <nav className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to Gallery
          </Link>
          <span className="text-xs text-zinc-600">Epstein Files Gallery</span>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">About This Archive</h1>
        <p className="text-zinc-500 text-sm mb-10">
          A public-interest resource for journalists, researchers, and the
          general public.
        </p>

        <section className="space-y-8 text-zinc-300 leading-relaxed">

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              What Is This Site?
            </h2>
            <p>
              Epstein Files Gallery is an independent, non-commercial archive
              that presents more than 5,600 images drawn from official U.S.
              court documents, deposition exhibits, flight logs, and
              investigative records related to the Jeffrey Epstein case. All
              source material is publicly available through the U.S. Department
              of Justice and federal court filings.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">Purpose</h2>
            <p className="mb-3">
              The archive exists to make public-domain legal records easy to
              browse and search without paywalls or friction. Our goals are:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-white">Transparency</strong> — The
                Epstein case involves matters of significant public concern.
                Centralizing the documents helps citizens and journalists engage
                with the primary evidence directly.
              </li>
              <li>
                <strong className="text-white">Accessibility</strong> — Raw PDFs
                are hard to navigate. This gallery provides thumbnails, filters
                (people, documents, groups, high-res), and an interactive flight
                history map so researchers can find relevant material quickly.
              </li>
              <li>
                <strong className="text-white">Preservation</strong> — Digital
                court records can be difficult to access over time. This archive
                ensures the images remain available in a stable, indexed form.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              What&rsquo;s in the Archive?
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-white">5,600+ document images</strong>{" "}
                extracted from official court filings at full resolution
              </li>
              <li>
                <strong className="text-white">Flight history map</strong>{" "}
                visualizing routes logged in the Lolita Express flight records
              </li>
              <li>
                <strong className="text-white">AI-assisted filtering</strong>{" "}
                — images are tagged automatically for faces, text content,
                group photos, and image quality
              </li>
              <li>
                <strong className="text-white">Source attribution</strong> —
                every image links back to the source PDF and page number
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              Content Policy
            </h2>
            <p>
              All material displayed here is sourced from publicly released
              federal court documents. We do not publish private,
              non-public, or illegally obtained material. If you believe
              specific content has been published in error or violates
              applicable law, please contact us using the link below.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              Editorial Independence
            </h2>
            <p>
              This site is independent and non-partisan. We do not advocate for
              any political position or individual. The archive presents
              documents as-released by government authorities; editorial
              commentary is intentionally absent.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>
              For press inquiries, content removal requests, or general
              feedback, email{" "}
              <a
                href="mailto:support@cra-toolkit.com"
                className="text-blue-400 hover:underline"
              >
                support@cra-toolkit.com
              </a>
              . We aim to respond within 5 business days.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              Technology
            </h2>
            <p>
              The site is built with Next.js, deployed on Netlify, and uses
              open-source libraries for map visualization. Image extraction and
              AI tagging were performed with PyMuPDF and OpenCV. The full
              source is available on GitHub.
            </p>
          </div>

        </section>
      </main>

      <footer className="border-t border-white/10 mt-16 px-6 py-6 text-center text-zinc-600 text-sm">
        <p>
          &copy; {new Date().getFullYear()} Epstein Files Gallery &mdash;{" "}
          <Link href="/" className="hover:text-zinc-400 transition-colors">
            Gallery
          </Link>{" "}
          &middot;{" "}
          <Link href="/about/" className="hover:text-zinc-400 transition-colors">
            About
          </Link>{" "}
          &middot;{" "}
          <Link
            href="/privacy/"
            className="hover:text-zinc-400 transition-colors"
          >
            Privacy
          </Link>
        </p>
      </footer>
    </div>
  );
}
