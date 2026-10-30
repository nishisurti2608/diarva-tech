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
  window.matchMedia('(min-width: 801px)').addEventListener('change', () => setMenu(false));
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
