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
          <div class="stat-title"><i class="fas fa-ticket-alt"></i> Total Tickets</div>
          <div class="stat-number" id="statTotalTickets">—</div>
        </div>
        <div class="stat-card stat-card--orange">
          <div class="stat-title"><i class="fas fa-trophy"></i> Winning Tickets</div>
          <div class="stat-number" id="statWinTickets">—</div>
        </div>
        <div class="stat-card stat-card--purple">
          <div class="stat-title"><i class="fas fa-user-tie"></i> Supervisors</div>
          <div class="stat-number" id="statSupervisors">—</div>
        </div>
      </div>

      <div class="page-card">
        <h2><i class="fas fa-chart-pie"></i> Top Sellers by Volume</h2>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>#</th><th>Seller</th><th>Company</th><th>Total Sold</th><th>Commission</th></tr>
            </thead>
            <tbody id="topSellersBody">
              ${App.Utils.tableLoadingRow(5)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    /* Stats */
    App.Api.getDashboardStats().then(stats => {
      document.getElementById('statActiveSellers').textContent = stats.activeSellers ?? App.Data.sellers.length;
      document.getElementById('statTotalTickets').textContent  = (stats.totalTickets ?? App.Data.soldTickets.length).toLocaleString();
      document.getElementById('statWinTickets').textContent    = App.Data.winningTickets.length;
      document.getElementById('statSupervisors').textContent   = App.Data.supervisors.length;
    });

    /* Top sellers table */
    App.Api.getSellers().then(sellers => {
      const sorted = [...sellers].sort((a, b) => b.totalSold - a.totalSold);
      const tbody  = document.getElementById('topSellersBody');
      if (!sorted.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No sellers.', 5);
        return;
      }
      tbody.innerHTML = sorted.map((s, i) => `
        <tr>
          <td><strong>#${i + 1}</strong></td>
          <td>${App.Utils.escHtml(s.name)}</td>
          <td>${App.Utils.escHtml(s.companyName)}</td>
          <td><strong>${App.Utils.formatMoney(s.totalSold)}</strong></td>
          <td>${App.Utils.formatPercent(s.commission)}</td>
        </tr>
      `).join('');
    });
  },
};
