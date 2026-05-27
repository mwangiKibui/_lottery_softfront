/* =====================================================================
   PRINCE LOTO — Dashboard Page
   Admin view: sub-admin count, game/lottery category counts, recent draws.
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Dashboard = {
  _isAdmin() {
    const user = App.Auth.getUser();
    return user && user.role === 'admin';
  },

  render() {
    if (this._isAdmin()) {
      return `
        <div class="stats-grid" id="dashStatsGrid">
          <div class="stat-card stat-card--blue">
            <div class="stat-title"><i class="fas fa-building"></i> Sub-Admins</div>
            <div class="stat-number" id="statSubAdmins">—</div>
          </div>
          <div class="stat-card stat-card--green">
            <div class="stat-title"><i class="fas fa-dice"></i> Game Categories</div>
            <div class="stat-number" id="statGameCats">—</div>
          </div>
          <div class="stat-card stat-card--orange">
            <div class="stat-title"><i class="fas fa-calendar-alt"></i> Lottery Schedules</div>
            <div class="stat-number" id="statLotteryCats">—</div>
          </div>
        </div>

        <div class="winning-table-card">
          <div class="section-title"><i class="fas fa-trophy"></i> Recent Winning Numbers</div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Lottery</th>
                  <th>Date</th>
                  <th>Numbers</th>
                </tr>
              </thead>
              <tbody id="dashDrawsBody">
                ${App.Utils.tableLoadingRow(3)}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    /* Sub-admin / default view */
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
                <th>Lottery</th>
                <th>Date</th>
                <th>Numbers</th>
              </tr>
            </thead>
            <tbody id="dashDrawsBody">
              ${App.Utils.tableLoadingRow(3)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    if (this._isAdmin()) {
      this._initAdmin();
    } else {
      this._initSubAdmin();
    }
  },

  _initAdmin() {
    App.Api.getDashboardStats().then(stats => {
      const s = id => document.getElementById(id);
      if (s('statSubAdmins'))  s('statSubAdmins').textContent  = stats.subAdminCount  ?? '—';
      if (s('statGameCats'))   s('statGameCats').textContent   = stats.gameCatCount   ?? '—';
      if (s('statLotteryCats'))s('statLotteryCats').textContent= stats.lotteryCatCount ?? '—';
    }).catch(() => {});

    App.Api.getLatestDraws().then(draws => {
      this._renderDrawsTable(draws);
    }).catch(() => {
      const tbody = document.getElementById('dashDrawsBody');
      if (tbody) tbody.innerHTML = App.Utils.tableEmptyRow('No recent draws.', 3);
    });
  },

  _initSubAdmin() {
    App.Api.getDashboardStats().then(stats => {
      const s = id => document.getElementById(id);
      if (s('statTotalSell'))  s('statTotalSell').textContent  = App.Utils.formatMoney(stats.totalSell);
      if (s('statPaidAmount')) s('statPaidAmount').textContent = App.Utils.formatMoney(stats.paidAmount);
      if (s('statProfit'))     s('statProfit').textContent     = App.Utils.formatMoney(stats.profit);
    }).catch(() => {});

    App.Api.getLatestDraws().then(draws => {
      this._renderDrawsTable(draws);
    }).catch(() => {
      const tbody = document.getElementById('dashDrawsBody');
      if (tbody) tbody.innerHTML = App.Utils.tableEmptyRow('No recent draws.', 3);
    });
  },

  _renderDrawsTable(draws) {
    const tbody = document.getElementById('dashDrawsBody');
    if (!tbody) return;
    if (!draws || draws.length === 0) {
      tbody.innerHTML = App.Utils.tableEmptyRow('No recent draws.', 3);
      return;
    }
    tbody.innerHTML = draws.map(d => {
      const numsSummary = Array.isArray(d.numbers)
        ? d.numbers.map(n => `<span class="badge badge--neutral">${App.Utils.escHtml(n.gameCategory)}: <strong>${App.Utils.escHtml(n.number)}</strong></span>`).join(' ')
        : '—';
      return `
        <tr>
          <td>${App.Utils.escHtml(d.lottery || d.lotteryCategoryName || '')}</td>
          <td>${App.Utils.formatDate(d.date)}</td>
          <td>${numsSummary}</td>
        </tr>
      `;
    }).join('');
  },
};
