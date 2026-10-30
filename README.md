# City Boy Movement Ogun State

Static chapter website with leadership, programmes, photo albums, support group registration and a browser-local banner generator.

## Deploy to cbmogun.org

The production ZIP's `dist` files are already configured for https://cbmogun.org. Deploy `dist` at the domain root. Vercel settings are included in `vercel.json`; other static hosts can use `dist/_headers` and `dist/_redirects` where supported. Keep true 404 responses for missing pages. See SEO_LAUNCH.md for public indexing and verification steps.

To rebuild in place for your domain:

```sh
SITE_URL=https://cbmogun.org python3 build.py
python3 check_seo.py
```

To export a separate ZIP without changing the local preview domain:

```sh
python3 export_site.py --url https://cbmogun.org --output cbm-ogun-production.zip
```

Optional Google/Bing HTML verification tokens can be passed as GOOGLE_SITE_VERIFICATION and BING_SITE_VERIFICATION when building/exporting. No tracking, account system or database is included.

## Preview and edit

`python3 build.py` regenerates HTML using Python 3 and the standard library. Preview with `python3 serve.py` (http://localhost:8765), which serves `dist` like Vercel does: clean URLs without `.html`, the redirects in vercel.json and the /studio routes. SITE_URL defaults to https://cbmogun.org; set it to build for another domain.

- Content and page templates: build.py; About page: about_body.html; banner page: banner_body.html.
- Executives: executives.json. Photos remain in dist/assets/executives.
- Gallery: gallery.json (image, title, alt, description, category); photo files in dist/assets/gallery. Category filters are configured in build.py. Add accurate image dimensions to image_dimensions.json for new files.
- Metadata/schema/sitemap: seo.py. Pages are served without .html (`cleanUrls` in vercel.json) and every internal link, canonical and sitemap entry uses the clean address. Checks: check_seo.py.
- Styles: dist/assets/style.css. Interactions: dist/assets/app.js.
- The original logo is unchanged. A smaller lossless copy serves the header; the original is retained for banner artwork and authorised downloads.
- News & Events: posts come from Sanity project zn3hw447 by default (see below); set SANITY_PROJECT_ID to use another project.
- Banner generator: dist/assets/banner.js. Fixed wording “I am City Boy”; portrait or square PNG; names and photos stay in the browser.
- Support group registration embeds the chapter Google Form on its own page.
- All membership links go to https://cbmnigeria.org/register.

The existing private Site identity is stored in .openai/hosting.json for updates to that Site. It is not required for ordinary static hosting and is excluded from the production ZIP.

## News & Events (Sanity)

The News & Events page has a Featured post, a "More to explore" grid (9 per page) and a category filter. Posts are fetched from Sanity when the site is built, so every page stays static HTML. The integration is in `sanity.py` and uses only the Python standard library.

1. Create a Sanity project at sanity.io/manage with a public `production` dataset.
2. Studio: the project ID (`zn3hw447`) is the default in `studio/sanity.config.js`. `cd studio`, `npm install`, then `npm run dev -- --port 3000` (http://localhost:3000/studio/). On Vercel the Studio is built into `dist/studio` and served at https://cbmogun.org/studio; `seo.py` gives /studio its own headers and routes. For sign-in to work there, add https://cbmogun.org and https://www.cbmogun.org under sanity.io/manage → API → CORS origins with "Allow credentials" ticked. To build it locally: `cd studio && npx sanity build ../dist/studio --yes`. The backup copy at https://cbmogun.sanity.studio comes from `npm run deploy`.
3. In the Studio, create Categories, then posts. Tick "Featured post" on the one to show in the Featured slot; otherwise the newest post is featured.
4. Build with the project settings:

```sh
SANITY_PROJECT_ID=zn3hw447 SANITY_DATASET=production python3 build.py
python3 check_seo.py
```

`SANITY_TOKEN` is optional and only needed for a private dataset. Post pages are written to `dist/news/<slug>.html` and served at /news/<slug>; pages for unpublished posts are removed on each build. Old /updates links redirect to /news.

Pages also refresh in the browser (`dist/assets/news.js`): the listing, homepage cards and post pages fetch the latest published posts from Sanity, so new posts and edits appear without a rebuild. Posts published after the last build open at `/post?slug=<slug>` until the next build gives them their own page. If the fetch fails, visitors see the built version. The browser fetch only works from origins listed in sanity.io/manage → API → CORS origins (add https://cbmogun.org, https://www.cbmogun.org and http://localhost:8765, no credentials needed).

Rebuilding is still worthwhile because search engines and link previews read the built HTML. On Vercel, set `SANITY_PROJECT_ID` and `SANITY_DATASET` as environment variables. `vercel.json` runs `python3 build.py` on each deploy. To publish automatically, create a Vercel Deploy Hook and add it as a Sanity webhook (sanity.io/manage → API → Webhooks) that fires on create, update and delete of `post` documents.
