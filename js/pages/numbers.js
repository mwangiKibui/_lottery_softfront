/* =====================================================================
   PRINCE LOTO — Draw Numbers Page
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Numbers = {
  render() {
    const lotteryOptions = App.Data.lotteries.map(l => `<option value="${App.Utils.escHtml(l)}">${App.Utils.escHtml(l)}</option>`).join('');

    return `
      <div class="page-card">
        <h2><i class="fas fa-dice-d6"></i> Draw Numbers (Numéros)</h2>

        <div class="filter-card">
          <div class="filter-title"><i class="fas fa-filter"></i> Filters</div>
          <div class="filter-grid">
            <div class="filter-field">
              <label>Lottery</label>
              <select id="numLotteryFilter"><option value="">All Lotteries</option>${lotteryOptions}</select>
            </div>
            <div class="filter-field">
              <label>From Date</label>
              <input type="date" id="numFromDate">
            </div>
            <div class="filter-field">
              <label>To Date</label>
              <input type="date" id="numToDate">
            </div>
            <div>
              <button class="btn btn-gradient btn-sm" id="searchNumBtn">
                <i class="fas fa-search"></i> Search
              </button>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>Draw ID</th><th>Lottery</th><th>Lot 3</th><th>2nd</th><th>3rd</th><th>Date</th></tr>
            </thead>
            <tbody id="numTableBody">
              ${App.Utils.tableLoadingRow(6)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    document.getElementById('searchNumBtn').addEventListener('click', () => this._load());
    ['numLotteryFilter','numFromDate','numToDate'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => this._load());
    });
    this._load();
  },

  _load() {
    const lottery  = document.getElementById('numLotteryFilter')?.value;
    const fromDate = document.getElementById('numFromDate')?.value;
    const toDate   = document.getElementById('numToDate')?.value;

    const tbody = document.getElementById('numTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(6);

    App.Api.getDrawNumbers({ lottery, fromDate, toDate }).then(draws => {
      if (!draws.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No draw results found.', 6);
        return;
      }
      tbody.innerHTML = draws.map(d => `
        <tr>
          <td><code>${App.Utils.escHtml(d.drawId)}</code></td>
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
