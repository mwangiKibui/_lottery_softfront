/* =====================================================================
   PRINCE LOTO — Application Router & Shell
   Initializes auth guard, navigation, and page switching.
   ===================================================================== */

(function () {
  /* ── Auth guard ── */
  if (!App.Auth.requireAuth()) return;

  /* ── Current user & role ── */
  const user    = App.Auth.getUser();
  const isAdmin = user && user.role === 'admin';

  /* ── Role-based navigation visibility ── */
  const role = user ? user.role : '';
  document.querySelectorAll('.nav-item[data-roles]').forEach(el => {
    const allowed = el.dataset.roles.split(',');
    el.hidden = !allowed.includes(role);
  });

  /* ── Sub-admin company branding (topbar left — replaces brand) ── */
  if (!isAdmin && user) {
    const companySection = document.getElementById('topbarCompanyInfo');
    const brandEl        = document.getElementById('brandBtn');
    if (companySection) {
      const logoWrap = document.getElementById('topbarLogoWrap');
      const nameEl   = document.getElementById('topbarCompanyName');

      nameEl.textContent = user.companyName || user.name;

      if (user.companyLogo) {
        const baseUrl = App.Config.API_BASE_URL.replace(/\/api$/, '');
        const img     = document.getElementById('topbarCompanyLogo');
        img.src       = `${baseUrl}/${user.companyLogo}`;
        img.alt       = user.companyName || 'Company Logo';
        img.onerror   = function () {
          logoWrap.innerHTML = '<i class="fas fa-building topbar-company-logo-placeholder"></i>';
        };
      } else {
        logoWrap.innerHTML = '<i class="fas fa-building topbar-company-logo-placeholder"></i>';
      }

      companySection.hidden = false;
      if (brandEl) brandEl.hidden = true;
    }
  }

  /* ── Page registry ── */
  const PAGES = {
    dashboard:         App.Pages.Dashboard,
    sellers:           App.Pages.Sellers,
    supervisors:       App.Pages.Supervisors,
    reports:           App.Pages.Reports,
    payment:           App.Pages.Payment,
    soldtickets:       App.Pages.SoldTickets,
    wintickets:        App.Pages.WinTickets,
    numbers:           App.Pages.Numbers,
    limit:             App.Pages.Limit,
    percentagelimit:   App.Pages.PercentageLimit,
    statistics:        App.Pages.Statistics,
    // Admin-only pages
    gamecategories:    App.Pages.GameCategories,
    lotterycategories: App.Pages.LotteryCategories,
    subadmins:         App.Pages.SubAdmins,
    // Sub-admin pages
    blocknumbers:      App.Pages.BlockNumbers,
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
  if (user) {
    const nameEl = document.getElementById('topbarUserName');
    if (nameEl) {
      const roleLabel = isAdmin
        ? '(Admin)'
        : user.role === 'subAdmin'
          ? '(Sub-Admin)'
          : user.role === 'superVisor'
            ? '(Supervisor)'
            : '(Seller)';
      const roleBadge = ` <small style="opacity:.7">${roleLabel}</small>`;
      nameEl.innerHTML = App.Utils.escHtml(user.name || user.username || 'User') + roleBadge;
    }
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
