/* GA4 (ID in data/ga.json) plus a few meaningful events. */
(function () {
  let on = false;
  window.trackEvent = (n, p) => { if (on && window.gtag) window.gtag('event', n, p || {}); };
  fetch('data/ga.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(c => {
    if (!c || !c.enabled || !c.measurementId) return;
    const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(c.measurementId); document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date()); gtag('config', c.measurementId); on = true;
  }).catch(() => {});
  document.addEventListener('click', e => { const a = e.target.closest('a'); if (!a) return; const h = a.getAttribute('href') || '';
    if (h.endsWith('.pdf')) trackEvent('resume_download'); else if (h.startsWith('mailto:')) trackEvent('email_click'); });
})();
