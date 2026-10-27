# CBM Ogun — SEO implementation and public launch

The downloadable production build is configured for https://cbmogun.org. The private ChatGPT Site retains its own canonical URL and audience. Run `python3 export_site.py --url https://cbmogun.org --output cbm-ogun-production.zip` to regenerate the production package. Python 3 standard library is sufficient for the HTML build, export and audit.

## Implemented

- Unique descriptive titles and meta descriptions for all 18 pages.
- Consistent canonical, Open Graph and Twitter URLs; named social accounts; accessible preview images.
- Organization and WebSite schema using the verified chapter name, original logo, Ogun State service area and supplied social handles. No invented address, opening hours, reviews or ratings.
- Page and breadcrumb schema; gallery ImageObjects; free browser banner WebApplication schema. No fabricated publication dates, event schedules or search action.
- 16 indexable canonical URLs in the XML sitemap, with images attached to the pages where they appear. Privacy and 404 pages use noindex and stay out of the sitemap.
- Crawlable navigation and support group registration footer link. Removed pages remain absent. Home links point to `/`; `/index.html` redirects to `/` on supported hosts.
- Explicit image dimensions, async decoding, existing lazy loading, 800px gallery variants with srcset and sizes, preload/high priority for the homepage hero.
- Smaller lossless header logo (same artwork) and JPEG sharing image. Gallery originals remain available to the viewer.
- One-week asset caching with revalidation allowance. Generated CSP hashes permit the exact JSON-LD blocks without arbitrary inline JavaScript.
- Repeatable static audit: `python3 check_seo.py`.

## Before indexing cbmogun.org

1. Deploy the ZIP's `dist` directory publicly on cbmogun.org. With Vercel, upload the extracted project and use its included vercel.json. Keep .html page URLs: canonical, sitemap and internal links use that convention.
2. Configure HTTPS and choose the non-www hostname as primary. Redirect www.cbmogun.org to cbmogun.org through the hosting/domain dashboard. Do not redirect the current private preview to the public domain until the production deployment is ready.
3. Confirm the production homepage and valid pages return HTTP 200; missing paths return HTTP 404, not a homepage rewrite. Preserve the site's custom 404.html.
4. Add a Domain property for cbmogun.org in Google Search Console and verify the DNS TXT record. This requires domain/account access. Optional HTML verification can be generated with GOOGLE_SITE_VERIFICATION for URL-prefix verification. BING_SITE_VERIFICATION is supported too.
5. Submit https://cbmogun.org/sitemap.xml in Search Console and Bing Webmaster Tools. Inspect the homepage, leadership, gallery, banner and support group pages and request indexing where appropriate.
6. Confirm canonical URLs, image URLs and robots.txt all reference cbmogun.org. Test Organisation/Breadcrumb schema with Google's Rich Results Test and Schema.org Validator. Structured-data eligibility does not guarantee enhanced search presentation.
7. Run PageSpeed Insights on the public homepage and gallery for mobile and desktop. Record real LCP, CLS and INP when field data becomes available. No Lighthouse score or Core Web Vitals pass is claimed by the static audit.
8. Link cbmogun.org from the chapter's X and Instagram profiles. Request an accurate Ogun chapter link from the national organisation's website. Publish authentic announcements with dates, location and original images when available; avoid buying links or copying national articles.

## Ongoing measurement

Review Search Console indexing, branded searches (CBM Ogun, City Boy Movement Ogun and City Boy Movement Ogun State), impressions, clicks and click-through rate monthly. Improve the pages users are actually finding. Track completed registration through the Google Form owner's reporting; the website cannot observe cross-origin Google Form submissions or national registrations without a separately authorised integration.

## Limits

The ChatGPT Site is currently owner-private and cannot be crawled by public search engines. Public hosting, DNS verification, sitemap submission and live Google/Bing validation have not been performed. The code is prepared; these account/domain actions remain. Search rankings and time to indexing are determined by search engines, not guaranteed by these changes.

Google references: https://developers.google.com/search/docs/appearance/structured-data/organization ; https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls ; https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview .
