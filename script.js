/* =========================================================
   Portfólio · Julia Mota de Aro — JavaScript puro
   Seções: tema · loading · menu · scroll reveal · scroll spy ·
           links vazios · formulário
   ========================================================= */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---------- 1. MODO CLARO / ESCURO ---------- */
  const themeBtn = $('#theme-toggle');
  const themeMeta = $('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const dark = theme === 'dark';
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeBtn.textContent = dark ? 'Claro' : 'Escuro';           // mostra o modo para o qual vai trocar
    themeBtn.setAttribute('aria-label', dark ? 'Mudar para o modo claro' : 'Mudar para o modo escuro');
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#1c1c1c' : '#fafaff');
  }
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.classList.add('theme-transition');
    applyTheme(next);
    try { localStorage.setItem('jm-theme', next); } catch (e) { /* sem storage: tudo bem */ }
    setTimeout(() => root.classList.remove('theme-transition'), 600);
  });

  /* ---------- 2. LOADING ---------- */
  const loader = $('#loader');
  const MIN_LOADING = reduceMotion ? 300 : 1500;
  const startedAt = performance.now();
  let closed = false;

  function closeLoader() {
    if (closed) return;
    closed = true;
    document.body.classList.add('is-ready');
    if (loader) {
      loader.classList.add('is-done');
      setTimeout(() => loader.remove(), 700);
    }
  }
  function scheduleClose() {
    setTimeout(closeLoader, Math.max(0, MIN_LOADING - (performance.now() - startedAt)));
  }
  if (document.readyState === 'complete') scheduleClose();
  else window.addEventListener('load', scheduleClose);
  setTimeout(closeLoader, 3500);                 // segurança: nunca prende o visitante
  loader?.addEventListener('click', closeLoader);

  /* ---------- 3. MENU NO CELULAR ---------- */
  const menuBtn = $('#menu-btn');
  const nav = $('#nav');
  const topbar = $('.topbar');

  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Fechar' : 'Menu';
    if (open) $('a', nav)?.focus();
  }
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
  });
  // se a janela crescer para desktop com o menu aberto, fecha
  window.matchMedia('(min-width: 860px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // linha fina sob a barra depois de rolar
  const onScroll = () => topbar.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 4. ANIMAÇÕES AO ROLAR (IntersectionObserver) ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => obs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- 5. SCROLL SPY ---------- */
  const navLinks = $$('a[data-spy]');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);

  function setActive(id) {
    navLinks.forEach((a) => {
      const on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window) {
    // faixa de leitura no meio da tela: a seção que a cruza é a atual
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach((s) => spy.observe(s));
  }
  window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) setActive('contato');
  }, { passive: true });
  setActive('inicio');

  /* ---------- 6. LINKS AINDA NÃO PREENCHIDOS ---------- */
  $$('a[data-placeholder]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

  /* ---------- 7. FORMULÁRIO (validação, sem backend) ---------- */
  const form = $('#contact-form');
  const status = $('#form-status');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const rules = {
    nome: (v) => (v.trim().length < 2 ? 'Como você se chama? Pelo menos 2 letras.' : ''),
    email: (v) => (!EMAIL_RE.test(v.trim()) ? 'Esse e-mail parece estranho. Algo como nome@exemplo.com?' : ''),
    mensagem: (v) => (v.trim().length < 10 ? 'Conte um pouquinho mais: pelo menos 10 caracteres.' : '')
  };

  function validateField(input) {
    const msg = rules[input.name](input.value);
    $('#err-' + input.name).textContent = msg;
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    return !msg;
  }

  const inputs = $$('input, textarea', form);
  inputs.forEach((input) => {
    input.addEventListener('blur', () => { if (input.value) validateField(input); });
    input.addEventListener('input', () => { if (input.hasAttribute('aria-invalid')) validateField(input); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.classList.remove('show');
    const results = inputs.map(validateField);
    if (results.includes(false)) {
      status.textContent = 'Tem campo precisando de atenção.';
      status.classList.add('show');
      inputs[results.indexOf(false)].focus();
      return;
    }
    // Sem backend por enquanto: nada é enviado a nenhum servidor.
    status.textContent = 'Tudo certo por aqui. Como o site ainda não tem servidor, a mensagem não foi enviada a lugar nenhum; por enquanto, use os links ao lado.';
    status.classList.add('show');
    status.focus();
    form.reset();
  });

  /* ---------- 8. RODAPÉ ---------- */
  $('#year').textContent = new Date().getFullYear();
})();