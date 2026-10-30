/* Renders everything from data/profile.json, then wires interactions and motion. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pic = (a, cls = '') => `<img class="${cls}" src="${a.src}" srcset="${a.src480} 480w, ${a.src} 800w" sizes="(max-width:700px) 90vw, 420px" width="${a.w}" height="${a.h}" alt="${esc(a.alt)}" loading="lazy" decoding="async">`;
  const years = iso => Math.max(0, Math.round((Date.now() - new Date(iso + '-01').getTime()) / (365.25 * 864e5) * 10) / 10);
  const tierKey = t => ({ 'Daily use': 'daily', 'Working': 'working', 'Learning': 'learning' }[t] || 'working');

  fetch('data/profile.json').then(r => { if (!r.ok) throw 0; return r.json(); }).then(d => { render(d); wire(); motion(); })
    .catch(() => { const e = $('#err'); if (e) e.hidden = false; wire(); });

  function render(d) {
    const p = d.personal;
    $('#availability').textContent = p.availability;
    $('#headline').textContent = p.headline;
    $('#tagline').textContent = p.tagline;
    $('#heroPhoto').innerHTML = pic({ ...d.assets.hero, src480: d.assets.hero.src480 }, '').replace('loading="lazy"', 'fetchpriority="high"') +
      '<div class="chip-float f1"><i class="dot"></i><span>SQA Engineer<small>Dhaka, Bangladesh</small></span></div>' +
      '<div class="chip-float f2"><span>Postman · JMeter · SQL<small>daily toolkit</small></span></div>';
    $('#impact').innerHTML = d.impact.map(i => {
      const auto = i.value === 'auto'; const v = auto ? years(d.careerStart) : i.value;
      const num = parseFloat(v), suffix = String(v).replace(/[\d.]/g, '');
      return `<div class="stat card"><b data-count="${isNaN(num) ? '' : num}" data-dec="${auto ? 1 : 0}" data-suffix="${esc(suffix)}">${v}</b><span>${esc(i.label)}</span><small>${esc(i.note || '')}</small></div>`;
    }).join('');

    $('#photos').innerHTML = d.assets.milestones.map((m, i) => `<figure>${pic(m)}<figcaption>${i ? 'B.Sc. in CSE, Daffodil International University' : 'Graduation day, October 2023'}</figcaption></figure>`).join('');
    $('#summary').innerHTML = `<p>${esc(p.summary)}</p>`;
    $('#steps').innerHTML = d.approach.map(s => `<div class="step card"><i></i><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></div>`).join('');

    // skills
    const legend = `<div class="legend"><span><i class="tier daily"></i>Daily use</span><span><i class="tier working"></i>Working knowledge</span><span><i class="tier learning"></i>Learning</span></div>`;
    $('#skillFilters').innerHTML = ['All', 'Daily use', 'Working', 'Learning'].map((t, i) => `<button class="fchip" data-f="${t}" aria-pressed="${i === 0}">${t}</button>`).join('');
    $('#skillGrid').innerHTML = d.skills.groups.map(g => `<div class="sk card"><h3>${esc(g.name)}</h3><ul>${g.items.map(i =>
      `<li data-tier="${esc(i.tier)}"><i class="tier ${tierKey(i.tier)}"></i><div><b>${esc(i.name)}</b>${i.proof ? `<small>${esc(i.proof)}</small>` : ''}</div></li>`).join('')}</ul></div>`).join('');
    $('#learning').innerHTML = '<span class="eyebrow" style="width:100%">Currently upskilling</span>' + d.currentlyUpskilling.map(u => `<div><b>${esc(u.name)}</b> · ${esc(u.purpose)}</div>`).join('');

    // experience
    $('#timeline').innerHTML = d.experience.map(e => `<article class="card job"><div class="job-h"><h3>${esc(e.position)}</h3><span class="when">${esc(e.period)}</span></div>
      <p class="co">${esc(e.company)} · ${esc(e.location)}</p><ul>${e.achievements.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
      <div class="tags">${e.technologies.map(t => `<span>${esc(t)}</span>`).join('')}</div></article>`).join('');

    // projects
    const cat = k => /client/i.test(k) ? 'Client work' : /^tool/i.test(k) ? 'Tools' : /automation/i.test(k) ? 'Automation' : 'Independent';
    const cats = ['All', ...new Set(d.projects.map(x => cat(x.kind)))];
    $('#projFilters').innerHTML = cats.map((c, i) => `<button class="fchip" data-f="${c}" aria-pressed="${i === 0}">${c}</button>`).join('');
    const statusCls = s => /design|plan/i.test(s) ? 'plan' : /progress|ongoing|refinement/i.test(s) ? 'wip' : 'ok';
    $('#projGrid').innerHTML = d.projects.map((x, n) => {
      const lede = x.problem || x.solution; const hasCase = x.problem || (x.tricky && x.tricky.length);
      const links = x.links && x.links.github ? `<div class="plinks"><a href="${esc(x.links.github)}" target="_blank" rel="noopener">Source on GitHub</a></div>` : '';
      return `<article class="card proj ${x.featured ? '' : 'small'}" data-cat="${cat(x.kind)}">
        <div class="meta"><span class="pill kind">${esc(x.kind)}</span><span class="pill ${statusCls(x.status)}">${esc(x.status)}</span></div>
        <h3>${esc(x.title)}</h3><p class="lede">${esc(lede)}</p>
        <div class="tags">${x.technologies.map(t => `<span>${esc(t)}</span>`).join('')}</div>${links}
        ${hasCase ? `<button class="toggle" aria-expanded="false" aria-controls="case${n}">Case study <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg></button>
        <div class="case" id="case${n}"><div>${x.problem ? `<h4>Approach</h4><p>${esc(x.solution)}</p>` : ''}
        ${x.tricky ? `<h4>Hard parts</h4><ul class="hard">${x.tricky.map(t => { const i = t.indexOf(':'); return `<li><b>${esc(t.slice(0, i))}</b>${esc(t.slice(i + 1).trim())}</li>`; }).join('')}</ul>` : ''}</div></div>` : ''}
      </article>`; }).join('');

    // education
    const e = d.education[0];
    $('#eduCard').innerHTML = `<span class="eyebrow">Degree</span><h3>${esc(e.degree)}</h3><p>${esc(e.institution)}, ${esc(e.location)}</p><p style="color:var(--t3);font-size:.88rem">${esc(e.period)}</p>`;
    $('#certs').innerHTML = d.certifications.map(c => `<li><b>${esc(c.name)}</b><span>${esc(c.issuer)}</span></li>`).join('');
    const s = p.social;
    $('#clinks').innerHTML = `<a href="tel:${esc(p.phone.replace(/[^\d+]/g, ''))}">${esc(p.phone)}</a><a href="${esc(s.linkedin)}" target="_blank" rel="noopener">LinkedIn</a><a href="${esc(s.github)}" target="_blank" rel="noopener">GitHub</a><a href="${esc(s.github_projects)}" target="_blank" rel="noopener">GitHub (test projects)</a><a href="assets/resume.pdf" download="Rizbi_Islam_Resume.pdf">Resume (PDF)</a><a href="cv/" target="_blank" rel="noopener">Bio-data</a>`;
  }

  function wire() {
    $('#yr').textContent = new Date().getFullYear();
    // theme
    const root = document.documentElement, tb = $('#theme');
    const paint = () => { const t = root.getAttribute('data-theme'); tb.textContent = t === 'dark' ? '☀' : '☾'; tb.setAttribute('aria-label', 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' theme'); };
    paint();
    tb.addEventListener('click', () => { const t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; root.setAttribute('data-theme', t); localStorage.setItem('portfolio-theme', t); paint(); });
    // mobile menu
    const links = $('#links'), bg = $('#burger');
    bg.addEventListener('click', () => { const o = links.classList.toggle('open'); bg.setAttribute('aria-expanded', o); });
    links.addEventListener('click', e => { if (e.target.tagName === 'A') { links.classList.remove('open'); bg.setAttribute('aria-expanded', false); } });
    // progress, nav, back-to-top
    const nav = $('#nav'), pr = $('#progress'), tt = $('#totop');
    const onScroll = () => { const h = document.documentElement; pr.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%'; nav.classList.toggle('scrolled', h.scrollTop > 10); tt.classList.toggle('show', h.scrollTop > 700); };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    tt.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
    // scroll spy
    const spy = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) document.querySelectorAll('.links a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));
    // filters
    document.addEventListener('click', e => {
      const f = e.target.closest('.fchip'); if (f) {
        const bar = f.parentElement; bar.querySelectorAll('.fchip').forEach(b => b.setAttribute('aria-pressed', b === f));
        const v = f.dataset.f;
        if (bar.id === 'skillFilters') document.querySelectorAll('#skillGrid li').forEach(li => li.classList.toggle('dim', v !== 'All' && li.dataset.tier !== v));
        if (bar.id === 'projFilters') document.querySelectorAll('.proj').forEach(c => c.classList.toggle('hide', v !== 'All' && c.dataset.cat !== v));
      }
      const t = e.target.closest('.toggle'); if (t) { const o = t.getAttribute('aria-expanded') !== 'true'; t.setAttribute('aria-expanded', o); document.getElementById(t.getAttribute('aria-controls')).classList.toggle('open', o); if (window.trackEvent) trackEvent('case_study_toggle', { open: o }); }
    });
    // card spotlight
    document.addEventListener('pointermove', e => { const c = e.target.closest('.card'); if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); } }, { passive: true });
  }

  function motion() {
    if (!window.gsap || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('[data-hero="reveal"]', { y: 26, opacity: 0, duration: .8, stagger: .1 })
      .from('[data-hero="photo"]', { y: 30, opacity: 0, scale: .96, duration: 1 }, .15)
      .from('.chip-float', { scale: .8, opacity: 0, duration: .5, stagger: .15, ease: 'back.out(2)' }, '-=.3')
      .from('#impact .stat', { y: 20, opacity: 0, duration: .6, stagger: .1 }, '-=.4');
    document.querySelectorAll('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count); if (isNaN(end)) return; const dec = +el.dataset.dec, suf = el.dataset.suffix || ''; const o = { v: 0 };
      gsap.to(o, { v: end, duration: 1.4, delay: .9, ease: 'power2.out', onUpdate: () => el.textContent = o.v.toFixed(dec) + suf });
    });
    ScrollTrigger.batch('section.s .card, .photos figure', { start: 'top 92%', once: true,
      onEnter: els => gsap.from(els, { y: 22, opacity: 0, duration: .6, stagger: .07, ease: 'power2.out', clearProps: 'transform,opacity' }) });
    gsap.to('.blob.a', { yPercent: 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }
})();
