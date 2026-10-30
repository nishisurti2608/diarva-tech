# Google Analytics setup status

Status: integration implemented and tested; inactive because the owner has not yet supplied the intended GA4 Measurement ID. No GA account/property has been created, and live delivery to Google's reports has not been verified.

## Owner/account step

Use the Google account that should own the business analytics. In Google Analytics, select or create the Diarva Tech property and a Web data stream for the chosen website URL. Copy its Measurement ID beginning with G-. Do not send a password, API secret, or Google account credentials in chat.

Official setup instructions: https://support.google.com/analytics/answer/9304153

The reporting time zone can be America/Toronto; use the business's intended reporting currency. These account choices have not been set by this code change.

## Website activation

After the owner supplies the real ID:

```sh
python3 scripts/configure-site.py --ga4-id G-YOURREALID
python3 scripts/check-site.py
node --test tests/*.test.cjs
```

The placeholder above is instructional only. Do not deploy a guessed ID or somebody else's property ID. Configuration is in dist/site-config.js. The ID is public, not a secret.

The website uses basic consent mode: the Google tag does not load before an affirmative choice. Advertising storage, personalization, user data and Google signals are disabled by the website configuration. A visitor can reject analytics, or reopen settings from the footer; revocation clears the integration's analytics cookies and reloads the page to remove already loaded Google code. Cookie settings are not shown while the Measurement ID is blank.

Consent implementation reference: https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic

## Events

| Event | Meaning |
| --- | --- |
| page_view | A page was viewed after analytics consent |
| service_interest | A homepage capability card was opened |
| contact_section_open | A link to the enquiry section was clicked |
| contact_click | Email, phone, or map action was clicked |
| portfolio_click | A supplied project link was opened |

An email click is not a completed enquiry; it is deliberately not generate_lead. Confirmed leads should be recorded separately through actual enquiries or a future tested form/CRM integration.

The integration strips query strings and fragments from page locations and sends only the origin of the referring site. It uses fixed contact-method labels rather than sending email addresses, phone numbers or full link targets. Campaign attribution accepts simple lower-case campaign codes from utm_source, utm_medium and utm_campaign. Never put a recipient's name or email in a tracking URL.

## Account configuration and verification still needed

- Review enhanced measurement in the GA property; disable form interactions and unwanted automatic events for this contact-link site, and review default page-view settings to avoid duplication.
- Review retention, internal-traffic exclusions, data sharing and applicable consent/privacy requirements in the actual account. These settings are not controlled by this repository.
- After activation, accept analytics on a test visit and verify one page_view plus the intended click events in Realtime/Tag Assistant. Then reject and confirm no new measurement occurs.
- Check requests are absent before consent and after a stored rejection. Test preference changes in the browser.
- Verify the intended stream/domain and production audience. The website is still private.

The automated tests validate code behaviour with a simulated ID; they do not establish that events have arrived in a real GA property.
