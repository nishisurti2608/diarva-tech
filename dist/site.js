(() => {
  document.documentElement.classList.add('js-enabled');
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  toggle.hidden = false;
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
    toggle.innerHTML = `${open ? 'Close' : 'Menu'} <span aria-hidden="true">${open ? '−' : '＋'}</span>`;
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  const desktop = window.matchMedia('(min-width: 801px)');
  function syncMenu() {
    setMenu(false);
    toggle.hidden = desktop.matches;
  }
  desktop.addEventListener('change', syncMenu);
  syncMenu();
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionToggle = document.querySelector('.motion-toggle');
  const heroMotion = document.querySelector('.hero-motion');
  let manuallyPaused = false;
  function syncMotion() {
    heroMotion.classList.toggle('motion-paused', manuallyPaused || motionPreference.matches);
    motionToggle.hidden = motionPreference.matches;
    motionToggle.setAttribute('aria-pressed', String(manuallyPaused));
    motionToggle.innerHTML = manuallyPaused ? 'Play motion <span aria-hidden="true">▷</span>' : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
  }
  motionToggle.addEventListener('click', () => { manuallyPaused = !manuallyPaused; syncMotion(); });
  motionPreference.addEventListener('change', syncMotion);
  syncMotion();
  if ('IntersectionObserver' in window && !motionPreference.matches) {
    const steps = [...document.querySelectorAll('.process-grid li')];
    const waiting = new Set();
    let revealTimer = null;
    let lastReveal = -Infinity;
    // Queue only visible steps, preserving their order with a deliberate 900ms cadence.
    function revealNext() {
      if (revealTimer !== null || waiting.size === 0) return;
      revealTimer = window.setTimeout(() => {
        revealTimer = null;
        const next = steps.find(step => waiting.has(step));
        if (next) {
          waiting.delete(next);
          next.classList.add('is-visible');
          observer.unobserve(next);
          lastReveal = performance.now();
        }
        revealNext();
      }, Math.max(0, 900 - (performance.now() - lastReveal)));
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('is-visible')) waiting.add(entry.target);
        else waiting.delete(entry.target);
      });
      revealNext();
    }, { threshold: 0.12 });
    steps.forEach(step => { step.classList.add('step-reveal'); observer.observe(step); });
    motionPreference.addEventListener('change', () => {
      if (motionPreference.matches) {
        window.clearTimeout(revealTimer);
        revealTimer = null;
        waiting.clear();
        observer.disconnect();
        steps.forEach(step => step.classList.add('is-visible'));
      }
    });
  }
  const copy = document.querySelector('.copy-email');
  const status = document.querySelector('.copy-status');
  if (navigator.clipboard && window.isSecureContext) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('tech@diarva.org');
        status.textContent = 'Email copied: tech@diarva.org';
      } catch {
        status.textContent = 'Please select and copy the email address above.';
      }
    });
  }
})();
