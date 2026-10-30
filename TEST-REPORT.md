# Diarva Tech — pre-launch test report

Date: October 30, 2026

Result: functional checks passed. Published review remains private. Public launch still requires replacing or removing the sample testimonials and intentionally enabling public access.

## Checks completed

| Area | Result | Evidence / scope |
| --- | --- | --- |
| Static document and assets | Pass | One h1/main, unique IDs, 21 section links, 7 local asset references, SVG/XML parsing, metadata, contact destinations, new-tab protection, and explicit sample labels |
| JavaScript syntax | Pass | Both site.js and hero-pixels.js parse successfully |
| Interaction regression suite | Pass | 8 tests covering desktop/mobile navigation, Escape focus, viewport changes, hero pause, reduced motion, ordered 900ms process reveals, offscreen queue behavior, clipboard success/error, pixel initialization/DPR limit, and image fallback |
| Responsive layout | Pass | Browser widths 320, 390, 768, 1024, 1440px; no horizontal document overflow; all local images loaded; mobile toggle hidden on desktop |
| Browser interactions | Pass | Mobile menu open/close and Escape, pause state, successful email copy feedback, and clicking a capability card reaches #contact |
| Rendered text contrast | Pass after correction | 108 eligible leaf text elements checked against computed backgrounds; zero remaining findings in this limited scan |
| Compact controls | Improved | Pause control minimum 32px; compact project/footer links have larger hit areas |
| Browser console | Pass | No captured warnings/errors during the tested flows |
| External portfolio URLs | Pass for HTTP reachability | www.diarva.org and the supplied TMC demo URL returned HTTP 200; client-specific authentication/access was not verified |
| Contact destinations | Pass | tech@diarva.org, tel:+13657670707, and a map search for the owner-supplied address |
| Testimonial samples | Pass for review only | Every quote is labelled a sample and uses an example company; the large preview notice was removed at the owner’s request |
| Launch-only content check | Expected hold | --launch returns a failure while sample testimonials are present |

## Issues fixed

- Three small About-section number labels had a computed contrast ratio of 4.14:1 on the off-white background. Darkened them to #666; repeat scan passed.
- Increased compact link/control hit areas for more comfortable interaction.

## Re-run commands

From this directory:

```sh
python3 scripts/check-site.py
node --test tests/interactions.test.cjs
node --check dist/site.js
node --check dist/hero-pixels.js
```

Before public launch:

```sh
python3 scripts/check-site.py --launch
```

The launch command intentionally reports the testimonial placeholders until the section is replaced with approved feedback or removed. It is a source-content check, not a hosting-permissions check.

## Limits and remaining launch work

- Replace testimonial copy and names with approved real feedback, or remove the draft section. No review ratings or review structured data were added.
- Site audience is still owner-private. Select public access or specific external reviewers when ready.
- Custom domain remains undecided; the current hosted subdomain works without buying one. Update canonical/social/sitemap URLs if a domain is connected.
- Portfolio illustrations are labelled illustrative; real screenshots and precise contribution descriptions remain a content improvement.
- Mailto/tel/maps destinations were inspected. No emails were sent, no phone calls placed, and no real inbox delivery was tested.
- Browser checks used the available browser engine and responsive viewport sizes. Physical-device testing, a cross-browser matrix, a full WCAG audit, load tests, penetration testing, and production traffic benchmarks were not performed.
- The contrast scan checks computed text/background colours and excludes decorative/hidden elements; it does not establish full accessibility compliance.

## Testimonial layout refinement

Removed the large preview banner. Added sample names and example companies; retained the concise Sample testimonial labels. Source checks pass with the updated labelling requirement. These remain layout examples rather than genuine customer endorsements.

## SEO, service pages, and analytics readiness update

- Expanded static validation passes across 7 HTML pages and 164 local references. Titles/descriptions are unique; canonical URLs match the sitemap; JSON-LD parses; no Review/AggregateRating schema is present.
- All 17 Node tests pass: the existing 8 interaction tests, 7 analytics consent/event tests, and 2 configuration/migration tests.
- The five new service pages and privacy page were checked in the browser at 390px and 1440px: no horizontal overflow, one h1 per page, correct canonical, no Google tag loaded with a blank Measurement ID, and no console warnings/errors captured.
- Homepage capability navigation reaches the corresponding service page; native FAQ disclosure opens; home navigation returns correctly.
- Analytics tests cover zero tag requests before consent, reject/accept, one page_view, withdrawal, storage denial, query/referrer sanitization, non-PII contact event labels, and stale choices. Tests use a simulated ID, not a live Google property.
- Configuration tests use disposable copies to verify that origin changes update all canonical/schema/sitemap URLs together, leave analytics disabled unless supplied, and reject invalid origins/IDs before modifying files.
- Outreach templates are drafts. No recipients were selected, no email account was connected, no DNS records were changed, and no emails were sent.

Outstanding: intended GA4 Measurement ID, real account settings and Realtime verification, owner-selected public launch/audience, final domain/Search Console ownership verification, approved testimonial replacement/removal, and outreach targeting/consent evidence. Search ranking, index inclusion, rich results, email deliverability, and live analytics delivery are not claimed.
