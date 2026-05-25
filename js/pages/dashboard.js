/* =====================================================================
   PRINCE LOTO — Dashboard Page
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Dashboard = {
  render() {
    return `
      <div class="stats-grid" id="dashStatsGrid">
        <div class="stat-card stat-card--green">
          <div class="stat-title"><i class="fas fa-coins"></i> Total Sales</div>
          <div class="stat-number" id="statTotalSell">—</div>
        </div>
        <div class="stat-card stat-card--blue">
          <div class="stat-title"><i class="fas fa-check-circle"></i> Amount Paid</div>
          <div class="stat-number" id="statPaidAmount">—</div>
        </div>
        <div class="stat-card stat-card--orange">
          <div class="stat-title"><i class="fas fa-chart-line"></i> Profit</div>
          <div class="stat-number" id="statProfit">—</div>
        </div>
      </div>

      <div class="winning-table-card">
        <div class="section-title"><i class="fas fa-trophy"></i> Latest Winning Numbers</div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Draw ID</th>
                <th>Lottery</th>
                <th>Lot 3</th>
                <th>2nd</th>
                <th>3rd</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody id="dashDrawsBody">
              ${App.Utils.tableLoadingRow(6)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    /* Load stats */
    App.Api.getDashboardStats().then(stats => {
      const el = App.Utils.qs;
      const s = id => document.getElementById(id);
      s('statTotalSell').textContent  = App.Utils.formatMoney(stats.totalSell);
      s('statPaidAmount').textContent = App.Utils.formatMoney(stats.paidAmount);
      s('statProfit').textContent     = App.Utils.formatMoney(stats.profit);
    });

    /* Load latest draws */
    App.Api.getLatestDraws().then(draws => {
      const tbody = document.getElementById('dashDrawsBody');
      if (!draws || draws.length === 0) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No recent draws.', 6);
        return;
      }
      tbody.innerHTML = draws.map(d => `
        <tr>
          <td>${App.Utils.escHtml(d.drawId)}</td>
          <td>${App.Utils.escHtml(d.lottery)}</td>
          <td><strong>${App.Utils.escHtml(d.lot3)}</strong></td>
          <td>${App.Utils.escHtml(d.sec2)}</td>
          <td>${App.Utils.escHtml(d.third)}</td>
          <td>${App.Utils.formatDate(d.date)}</td>
        </tr>
      `).join('');
    });
  },
};
