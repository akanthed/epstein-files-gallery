# ROLE

You are a senior full-stack performance engineer and SEO engineer.

You are optimizing a production Netlify-hosted website that is rapidly gaining organic traffic from Google Search.

Your goals are:

1. Reduce Netlify bandwidth usage
2. Reduce unnecessary requests/bot load
3. Improve SEO
4. Improve Core Web Vitals
5. Prepare the site for Google AdSense approval
6. Keep deployment fully compatible with Netlify
7. Do NOT migrate hosting providers
8. Preserve current search rankings

---

# CONTEXT

The website:

* is hosted on Netlify
* is receiving increasing Google Search traffic
* currently has high request counts and bandwidth usage
* includes document-heavy/searchable content
* is trending around a seasonal/news topic
* uses static assets and indexed pages heavily

Current issues:

* excessive bandwidth consumption
* millions of requests
* likely bot/crawler pressure
* performance optimization needed
* SEO improvements needed
* AdSense preparation needed

---

# TASKS

Perform ALL of the following improvements.

## 1. PERFORMANCE OPTIMIZATION

Audit and optimize:

* image sizes
* lazy loading
* script loading
* CSS loading
* font loading
* JavaScript bundle size

Implement:

* code splitting
* route-based lazy loading
* asset compression
* WebP/AVIF support
* preconnect where appropriate
* caching headers
* immutable static assets

Ensure:

* Lighthouse performance > 90
* mobile-first optimization

---

## 2. NETLIFY OPTIMIZATION

Implement Netlify-specific optimizations:

* proper `_headers`
* proper `_redirects`
* cache-control policies
* Brotli/gzip optimization
* edge caching recommendations
* prevent unnecessary rebuild triggers

Reduce:

* duplicate asset requests
* unnecessary API calls
* oversized payloads

---

## 3. BOT MITIGATION

Implement safe anti-bot protections without harming SEO.

Requirements:

* allow Googlebot/Bingbot
* block suspicious scraping patterns
* rate-limit abusive requests where possible
* prevent hotlinking of assets
* reduce repeated crawler hits

Add:

* robots.txt improvements
* crawl-delay recommendations if appropriate

---

## 4. SEO IMPROVEMENTS

Implement production-grade SEO.

Add/improve:

* sitemap.xml
* robots.txt
* canonical URLs
* Open Graph tags
* Twitter meta tags
* structured data/schema.org
* article metadata
* descriptive titles
* meta descriptions

Ensure:

* pages are indexable
* no duplicate metadata
* proper heading hierarchy

---

## 5. ADSENSE READINESS

Ensure compliance for AdSense approval.

Requirements:

* privacy policy page
* contact/about page
* clean navigation
* no intrusive popups
* no broken links
* mobile-friendly layout
* fast page speed
* proper semantic HTML

Avoid:

* misleading clickbait
* excessive ad placeholders
* spammy metadata

---

## 6. ANALYTICS

Add support for:

* Google Analytics 4
* Microsoft Clarity

Track:

* pageviews
* session duration
* traffic source
* top pages
* country data

---

## 7. SECURITY + STABILITY

Add:

* security headers
* CSP recommendations
* XSS protection headers
* referrer policy
* basic hardening

Ensure:

* no exposed secrets
* no public debug endpoints
* production-safe configuration

---

# OUTPUT FORMAT

Provide:

1. Step-by-step implementation plan
2. Exact code changes
3. File-by-file modifications
4. Netlify config updates
5. Performance impact estimates
6. SEO impact estimates
7. Bandwidth reduction estimates
8. Any risks or rollback considerations

Do NOT suggest migrating away from Netlify unless absolutely necessary.

Risks / Trade-offs
Important

Do NOT aggressively block bots blindly.

If you accidentally block:

Googlebot,
Google Ads crawler,
AdSense crawler,

you can damage:

indexing,
rankings,
monetization.
Another Important Point

Since your traffic is SEO-driven:

stability matters more than fancy features.

Avoid:

heavy animations,
huge JS frameworks,
unnecessary APIs.