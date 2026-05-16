import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Epstein Files Gallery",
  description:
    "Privacy Policy for Epstein Files Gallery. Learn how we collect, use, and protect information when you visit our site.",
  alternates: {
    canonical: "https://epsteinfiles.netlify.app/privacy/",
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const lastUpdated = "May 16, 2026";

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
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-zinc-500 text-sm mb-10">Last updated: {lastUpdated}</p>

        <section className="space-y-8 text-zinc-300 leading-relaxed">

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">1. Overview</h2>
            <p>
              Epstein Files Gallery (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
              &ldquo;the site&rdquo;) is a public-interest archive that makes
              official U.S. court documents related to the Jeffrey Epstein case
              freely available. This Privacy Policy explains what information is
              collected when you visit the site and how it is used.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. Information We Collect
            </h2>
            <p className="mb-3">
              We do not require registration or any personal information to
              browse the archive. However, certain third-party services we use
              may collect data automatically:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-white">Google Analytics 4</strong> —
                collects anonymized usage data including pages visited, session
                duration, general geographic region, and device type. IP
                addresses are anonymized. Data is governed by{" "}
                <a
                  href="https://policies.google.com/privacy"
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google&rsquo;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong className="text-white">Microsoft Clarity</strong> —
                collects anonymized session recordings and heatmap data to help
                us improve the user experience. Data is governed by{" "}
                <a
                  href="https://privacy.microsoft.com/privacystatement"
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Microsoft&rsquo;s Privacy Statement
                </a>
                .
              </li>
              <li>
                <strong className="text-white">Google AdSense</strong> — may
                serve interest-based ads and collect cookies to personalize
                advertising. Data is governed by{" "}
                <a
                  href="https://policies.google.com/technologies/ads"
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google&rsquo;s Advertising Policies
                </a>
                .
              </li>
              <li>
                <strong className="text-white">Netlify CDN</strong> — our
                hosting provider may log standard server access logs (IP
                address, browser type, request path) for security and
                performance monitoring. These logs are not used for
                advertising.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">3. Cookies</h2>
            <p>
              We do not set first-party cookies. Third-party services listed
              above (Google Analytics, Google AdSense, Microsoft Clarity) may
              set their own cookies on your device. You can opt out of
              interest-based advertising via{" "}
              <a
                href="https://optout.aboutads.info/"
                className="text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                aboutads.info
              </a>{" "}
              or by configuring your browser to block third-party cookies.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. How We Use Information
            </h2>
            <p>
              Analytics data is used solely to understand aggregate traffic
              patterns, identify popular content, and improve site performance.
              We do not sell, rent, or share personal information with third
              parties beyond the analytics providers listed above.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Children&rsquo;s Privacy
            </h2>
            <p>
              This site contains graphic legal documents intended for research
              and journalistic purposes. It is not directed at children under
              13. We do not knowingly collect personal information from minors.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Data Retention
            </h2>
            <p>
              We do not directly store personal data. Retention periods for
              data collected by third-party services are governed by their
              respective privacy policies (typically 14–26 months for Google
              Analytics).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Your Rights
            </h2>
            <p>
              Depending on your jurisdiction, you may have rights to access,
              correct, or delete personal data held about you. Because we
              process minimal personal data, most requests should be directed
              to the third-party services listed in Section 2. For any
              site-specific inquiries, contact us via the{" "}
              <Link href="/about/" className="text-blue-400 hover:underline">
                About page
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this policy periodically. The &ldquo;Last
              updated&rdquo; date at the top of this page reflects the most
              recent revision. Continued use of the site after changes
              constitutes acceptance of the updated policy.
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
          <Link href="/privacy/" className="hover:text-zinc-400 transition-colors">
            Privacy
          </Link>
        </p>
      </footer>
    </div>
  );
}
