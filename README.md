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

`python3 build.py` regenerates HTML using Python 3 and the standard library. Serve `dist` from the domain root using your static hosting preview. The default SITE_URL targets the existing private ChatGPT Site; production exports explicitly use cbmogun.org.

- Content and page templates: build.py; About page: about_body.html; banner page: banner_body.html.
- Executives: executives.json. Photos remain in dist/assets/executives.
- Gallery: gallery.json (image, title, alt, description, category); photo files in dist/assets/gallery. Category filters are configured in build.py. Add accurate image dimensions to image_dimensions.json for new files.
- Metadata/schema/sitemap: seo.py. Checks: check_seo.py.
- Styles: dist/assets/style.css. Interactions: dist/assets/app.js.
- The original logo is unchanged. A smaller lossless copy serves the header; the original is retained for banner artwork and authorised downloads.
- Banner generator: dist/assets/banner.js. Fixed wording “I am City Boy”; portrait or square PNG; names and photos stay in the browser.
- Support group registration embeds the chapter Google Form on its own page.
- All membership links go to https://cbmnigeria.org/register.

The existing private Site identity is stored in .openai/hosting.json for updates to that Site. It is not required for ordinary static hosting and is excluded from the production ZIP.
