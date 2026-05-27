/* =====================================================================
   PRINCE LOTO — Statistics Page
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Statistics = {
  render() {
    return `
      <div class="stats-grid" id="statStatsGrid">
        <div class="stat-card stat-card--green">
          <div class="stat-title"><i class="fas fa-users"></i> Active Sellers</div>
          <div class="stat-number" id="statActiveSellers">—</div>
        </div>
        <div class="stat-card stat-card--blue">
          <div class="stat-title"><i class="fas fa-dollar-sign"></i> Total Sales</div>
          <div class="stat-number" id="statTotalTickets">—</div>
        </div>
        <div class="stat-card stat-card--orange">
          <div class="stat-title"><i class="fas fa-hand-holding-usd"></i> Paid Out</div>
          <div class="stat-number" id="statWinTickets">—</div>
        </div>
        <div class="stat-card stat-card--purple">
          <div class="stat-title"><i class="fas fa-user-tie"></i> Supervisors</div>
          <div class="stat-number" id="statSupervisors">—</div>
        </div>
      </div>

      <div class="page-card">
        <h2><i class="fas fa-chart-pie"></i> Sellers</h2>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>#</th><th>Username</th><th>Email</th><th>Status</th></tr>
            </thead>
            <tbody id="topSellersBody">
              ${App.Utils.tableLoadingRow(4)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    /* Stats */
    App.Api.getDashboardStats().then(stats => {
      document.getElementById('statActiveSellers').textContent = stats.sellerCount ?? '—';
      document.getElementById('statTotalTickets').textContent  = App.Utils.formatMoney(stats.totalSell ?? 0);
      document.getElementById('statWinTickets').textContent    = App.Utils.formatMoney(stats.paidAmount ?? 0);
      document.getElementById('statSupervisors').textContent   = stats.supCount ?? '—';
    }).catch(() => {});

    /* Sellers table */
    App.Api.getSellers().then(resp => {
      const sellers = Array.isArray(resp.users) ? resp.users : [];
      const tbody   = document.getElementById('topSellersBody');
      if (!sellers.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No sellers registered yet.', 4);
        return;
      }
      const sorted = [...sellers].sort((a, b) =>
        (a.userName || '').localeCompare(b.userName || '')
      );
      tbody.innerHTML = sorted.map((s, i) => `
        <tr>
          <td><strong>#${i + 1}</strong></td>
          <td>${App.Utils.escHtml(s.userName || '—')}</td>
          <td>${App.Utils.escHtml(s.email    || '—')}</td>
          <td>${App.Utils.badge(s.isActive ? 'Active' : 'Inactive', s.isActive ? 'success' : 'neutral')}</td>
        </tr>
      `).join('');
    }).catch(() => {
      const tbody = document.getElementById('topSellersBody');
      if (tbody) tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load sellers.', 4);
    });
  },
};

