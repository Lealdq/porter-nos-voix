// Redirect to home on page refresh
(function () {
  if (window.location.pathname === '/home.html') return;
  const entries = performance.getEntriesByType('navigation');
  if (entries.length > 0 && entries[0].type === 'reload') {
    window.location.replace('/home.html');
  }
})();

// ── Menu hamburger mobile ────────────────────────────────────────
(function () {
  const header = document.querySelector('.site-header .container');
  const nav    = document.querySelector('.site-nav');
  if (!header || !nav) return;

  // Créer le bouton hamburger
  const btn = document.createElement('button');
  btn.className = 'nav-hamburger';
  btn.setAttribute('aria-label', 'Menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  header.appendChild(btn);

  function ouvrirMenu() {
    nav.classList.add('nav-mobile-open');
    btn.classList.add('actif');
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-ouvert');
    document.body.style.overflow = 'hidden';
  }

  function fermerMenu() {
    nav.classList.remove('nav-mobile-open');
    btn.classList.remove('actif');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-ouvert');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    btn.classList.contains('actif') ? fermerMenu() : ouvrirMenu();
  });

  // Fermer au clic sur un lien
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', fermerMenu));

  // Fermer avec Échap
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fermerMenu();
  });
})();

