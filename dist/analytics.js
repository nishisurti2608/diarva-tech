(() => {
  const id = window.DIARVA_CONFIG?.ga4MeasurementId || '';
  // Fail closed until the intended GA4 web stream is configured.
  if (!/^G-[A-Z0-9]{5,20}$/.test(id)) return;
  const banner = document.querySelector('.analytics-consent');
  const settings = document.querySelector('.analytics-settings');
  if (!banner || !settings) return;
  const storageKey = `diarva_analytics_choice_v1_${id}`;
  const maxAge = 180 * 24 * 60 * 60 * 1000;
  let choice = null;
  let loaded = false;
  window[`ga-disable-${id}`] = true;
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    const age = saved ? Date.now() - saved.timestamp : -1;
    if (saved && ['accepted', 'rejected'].includes(saved.value) && age >= 0 && age < maxAge) choice = saved.value;
  } catch { /* A denied storage permission does not imply analytics consent. */ }
  function persist(value) {
    choice = value;
    try { window.localStorage.setItem(storageKey, JSON.stringify({ value, timestamp: Date.now() })); } catch { /* Choice still applies to this page. */ }
  }
  function pageParameters() {
    const current = new URL(window.location.href);
    let referrer = '';
    try { if (document.referrer) referrer = new URL(document.referrer).origin; } catch { /* Ignore malformed referrers. */ }
    const parameters = { page_location: current.origin + current.pathname, page_title: document.title, page_referrer: referrer };
    // Use campaign codes only; never email addresses or recipient names in URLs.
    for (const [query, field] of [['utm_source', 'campaign_source'], ['utm_medium', 'campaign_medium'], ['utm_campaign', 'campaign_name']]) {
      const value = current.searchParams.get(query);
      if (value && /^[a-z][a-z0-9_-]{0,79}$/.test(value)) parameters[field] = value;
    }
    return parameters;
  }
  function track(name, parameters = {}) {
    if (choice !== 'accepted' || !loaded) return;
    window.gtag('event', name, { ...parameters, ...pageParameters(), send_to: id });
  }
  function enable() {
    if (loaded) return;
    window[`ga-disable-${id}`] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, ...pageParameters() });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
    loaded = true;
    track('page_view');
  }
  function clearAnalyticsCookies() {
    const domains = window.location.hostname.split('.');
    for (const name of ['_ga', `_ga_${id.slice(2)}`]) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      for (let index = 0; index < domains.length - 1; index++) {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domains.slice(index).join('.')}; SameSite=Lax`;
      }
    }
  }
  settings.hidden = false;
  settings.addEventListener('click', () => {
    banner.hidden = false;
    banner.querySelector('[data-consent="accepted"]').focus();
  });
  banner.querySelectorAll('[data-consent]').forEach(button => {
    button.addEventListener('click', () => {
      const value = button.getAttribute('data-consent');
      if (!['accepted', 'rejected'].includes(value)) return;
      persist(value);
      banner.hidden = true;
      if (value === 'accepted') enable();
      else {
        window[`ga-disable-${id}`] = true;
        clearAnalyticsCookies();
        // Reload after revocation so previously loaded Google code is removed.
        if (loaded) window.location.reload();
      }
      settings.focus();
    });
  });
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.startsWith('mailto:')) track('contact_click', { contact_method: 'email' });
    else if (href.startsWith('tel:')) track('contact_click', { contact_method: 'phone' });
    else if (href.startsWith('https://www.google.com/maps/')) track('contact_click', { contact_method: 'map' });
    else if (href.includes('tmc-menu-client-preview.boldlemon.chatgpt.site')) track('portfolio_click', { project: 'tmc_ordering_app' });
    else if (href === 'https://www.diarva.org') track('portfolio_click', { project: 'diarva_website' });
    else if (link.classList.contains('service-action')) track('service_interest', { service: link.closest('.service')?.querySelector('h3')?.textContent || 'service' });
    else if (href.endsWith('#contact')) track('contact_section_open');
  });
  if (choice === 'accepted') enable();
  else if (choice === null) banner.hidden = false;
})();
