# Diarva Tech — search visibility plan

## Implemented

- A dedicated, substantive page for each of the five service families, connected from the homepage and related-service links.
- Unique page titles and descriptions, HTTPS canonical URLs, and an updated seven-page sitemap.
- Organization and WebSite structured data on the homepage; Service and BreadcrumbList data on service pages. Only owner-supplied contact details are used. No testimonial/rating markup is included.
- Server-readable HTML, semantic headings, native FAQ disclosure controls, and responsive styles.
- A single configuration helper for changing the verified production origin, adding a GA4 Measurement ID, and inserting a Search Console verification token.

These are foundations for discoverability, not a promise of ranking or rich results. Google explicitly states there is no automatic route to first place: https://developers.google.com/search/docs/fundamentals/seo-starter-guide

## Required before Google can index the site

1. Choose whether to use the current hosted subdomain or a domain you own. A custom domain is optional, but decide before investing heavily in links to the site.
2. Make the site public when the owner is ready. It is currently owner-private; robots.txt and a sitemap cannot bypass authentication.
3. Replace the sample testimonials with genuine approved feedback, or remove that section. Do not publish review/rating schema for sample content.
4. Verify the chosen site in Google Search Console. A URL-prefix property can use the verification token supplied by Google; a domain property requires control of the domain's DNS.
5. Submit /sitemap.xml and inspect the homepage and five service URLs. Check that Google can fetch their actual content after publication.

Search Console property guidance: https://support.google.com/webmasters/answer/34592

## Relevant search themes

| Page | Initial search intent |
| --- | --- |
| Homepage | IT services for small and growing businesses in Canada |
| Software Engineering | Business website development and custom web applications |
| AI & Machine Learning | AI development, document assistants, workflow automation |
| Data & Analytics | BI dashboards, business reporting, data engineering |
| Experience Design | UI/UX design, product discovery, UX audits |
| Cloud & Platform Engineering | Cloud migration, DevOps, platform engineering |

These are starting themes, not measured keyword-volume estimates. Use Search Console impressions and enquiries to learn which terms and pages attract qualified visitors. Avoid repeating near-identical pages for Canadian cities.

## After launch

- Publish accurate case studies with the team's role, actual screenshots, and permission to show the work. Add measured outcomes only where evidence exists.
- Develop useful guides around real questions prospects ask: what belongs in a business website, how to scope an ordering app, or when a workflow needs automation.
- Earn relevant references through existing clients, partners, and useful contributions. Do not buy links or invent business credentials.
- Review impressions, clicks, indexed pages, and qualified enquiries regularly. Change priorities based on evidence rather than a promised ranking deadline.
- Check mobile usability, page performance, and broken links after content changes. The current work does not claim a Lighthouse score or Core Web Vitals result.

## Domain change helper

After verifying a domain belongs to the business:

```sh
python3 scripts/configure-site.py --url https://YOUR-VERIFIED-DOMAIN
python3 scripts/check-site.py
```

The helper updates static canonical/schema/social URLs, sitemap and robots URLs. It does not purchase a domain, change DNS, add redirects, or change Site access. Configure redirects and hosting separately when migrating.
