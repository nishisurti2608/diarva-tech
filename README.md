# Diarva Tech static website

The approved Stitch design is implemented with semantic HTML, responsive CSS and a small progressive-enhancement script. No package installation or build is required; deploy `dist/`.

## Local preview

From this directory: `python3 -m http.server 4173 --directory dist --bind 127.0.0.1`

## Content and brand

- Enquiries: `tech@diarva.org` via mailto links. No form submission backend or email delivery service is configured; visitors send through their own email app.
- Approved digital D mark and hero artwork are hosted locally in `dist/assets/`.
- The logo source and original concept are in the parent project's `assets/brand/`.
- Project illustrations are labelled illustrative; replace with real screenshots when supplied. No client outcomes or stacks are claimed.
- Fonts are loaded from Google Fonts with local system fallbacks; there is no analytics script.
- Serving businesses across Canada, with no city restrictions.

## Before a custom-domain launch

Choose and connect a domain, then update canonical and Open Graph URLs, robots.txt, and sitemap.xml. Site access is initially private and must be changed intentionally before prospective clients can visit. Review real project screenshots and portfolio display permissions. Any ongoing support promises must match the agreed contract.

## Validation performed

JavaScript syntax, local HTTP response, asset loading, internal fragment targets, exact contact destinations, mobile menu and Escape closing, clipboard success feedback, and mobile/desktop horizontal overflow were checked. Browser widths checked: 390px and 1440px. Inbox delivery was not tested because this site opens the visitor's email app and sends nothing itself.

## Interaction update

Desktop menu toggle removed; mobile menu retained. Hero is a CSS/SVG animated logo network with pause control and reduced-motion support. Capabilities have hover and focus states with contact links. Process cards reveal on scroll. Portfolio links use www.diarva.org and the owner-supplied TMC demo URL. Reach Us shows the supplied telephone, tech@diarva.org, and Kitchener address with a specific map search.

## Pixel logo hero

The hero now uses hero-pixels.js to sample the approved SVG and wordmark into square particles. A 12-second cycle assembles, holds, and disperses the logo. Pausing freezes the animation; reduced motion renders the assembled logo. SVG fallback remains visible when canvas/image/font initialization fails. No particle library or additional service is required.

## Pre-launch validation

Run `python3 scripts/check-site.py` and `node --test tests/interactions.test.cjs`. See TEST-REPORT.md for browser checks, corrections, scope and limitations. Use `python3 scripts/check-site.py --launch` before a public launch; it flags the deliberately labelled sample testimonials until they are replaced or removed.
