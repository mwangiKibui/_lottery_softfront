/* =====================================================================
   PRINCE LOTO — Application Router & Shell
   Initializes auth guard, navigation, and page switching.
   ===================================================================== */

(function () {
  /* ── Auth guard ── */
  if (!App.Auth.requireAuth()) return;

  /* ── Page registry ── */
  const PAGES = {
    dashboard:   App.Pages.Dashboard,
    sellers:     App.Pages.Sellers,
    supervisors: App.Pages.Supervisors,
    reports:     App.Pages.Reports,
    payment:     App.Pages.Payment,
    soldtickets: App.Pages.SoldTickets,
    wintickets:  App.Pages.WinTickets,
    numbers:     App.Pages.Numbers,
    limit:       App.Pages.Limit,
    statistics:  App.Pages.Statistics,
  };

  let currentPage = null;

  /* ── Render a page ── */
  function renderPage(pageName) {
    const page = PAGES[pageName];
    if (!page) return;

    const content = document.getElementById('mainContent');
    content.innerHTML = page.render();
    page.init();

    /* Update active nav item */
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === pageName);
    });

    currentPage = pageName;

    /* Close mobile sidebar on navigation */
    if (window.innerWidth <= 1024) closeSidebar();

    /* Scroll content to top */
    content.scrollTop = 0;
  }

  /* ── Navigation wiring ── */
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.querySelector('a').addEventListener('click', (e) => {
      e.preventDefault();
      renderPage(item.dataset.page);
    });
  });

  /* ── Brand / logo clicks → dashboard ── */
  document.getElementById('brandBtn')?.addEventListener('click',     () => renderPage('dashboard'));
  document.getElementById('sidebarBrandBtn')?.addEventListener('click', () => renderPage('dashboard'));

  /* ── Topbar user display ── */
  const user = App.Auth.getUser();
  if (user) {
    const nameEl = document.getElementById('topbarUserName');
    if (nameEl) nameEl.textContent = user.name || user.username || 'User';
  }

  /* ── Logout ── */
  document.getElementById('logoutBtn').addEventListener('click', () => {
    App.Auth.logout();
  });

  /* ── Mobile sidebar ── */
  const sidebar = document.getElementById('mainSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggleBtn = document.getElementById('menuToggle');

  function openSidebar() {
    if (window.innerWidth <= 1024) {
      sidebar.classList.add('open-mobile');
      overlay.classList.add('active');
      document.body.classList.add('sidebar-open');
    }
  }

  function closeSidebar() {
    sidebar.classList.remove('open-mobile');
    overlay.classList.remove('active');
    document.body.classList.remove('sidebar-open');
  }

  toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.contains('open-mobile') ? closeSidebar() : openSidebar();
  });

  overlay?.addEventListener('click', closeSidebar);

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) closeSidebar();
  });

  /* ── Boot: load dashboard ── */
  renderPage('dashboard');
})();
