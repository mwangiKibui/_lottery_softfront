/* =====================================================================
   PRINCE LOTO — Sold Tickets Page
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.SoldTickets = {
  render() {
    const sellerOptions  = App.Data.sellers.map(s => `<option value="${App.Utils.escHtml(s.name)}">${App.Utils.escHtml(s.name)}</option>`).join('');
    const supOptions     = App.Data.supervisors.map(s => `<option value="${App.Utils.escHtml(s.name)}">${App.Utils.escHtml(s.name)}</option>`).join('');
    const lotteryOptions = App.Data.lotteries.map(l => `<option value="${App.Utils.escHtml(l)}">${App.Utils.escHtml(l)}</option>`).join('');

    return `
      <div class="page-card">
        <h2><i class="fas fa-receipt"></i> Sold Tickets (Tickets Vendus)</h2>

        <div class="filter-card">
          <div class="filter-title"><i class="fas fa-filter"></i> Filters</div>

          <div class="radio-group">
            <label><input type="radio" name="soldScope" value="all" checked> All</label>
            <label><input type="radio" name="soldScope" value="seller"> By Seller</label>
            <label><input type="radio" name="soldScope" value="supervisor"> By Supervisor</label>
          </div>

          <div id="soldSellerDiv" style="display:none; margin-bottom:12px;">
            <div class="filter-field">
              <label>Seller</label>
              <select id="soldSellerSelect"><option value="">-- Select seller --</option>${sellerOptions}</select>
            </div>
          </div>
          <div id="soldSupervisorDiv" style="display:none; margin-bottom:12px;">
            <div class="filter-field">
              <label>Supervisor</label>
              <select id="soldSupervisorSelect"><option value="">-- Select supervisor --</option>${supOptions}</select>
            </div>
          </div>

          <div class="filter-grid">
            <div class="filter-field">
              <label>Lottery</label>
              <select id="soldLotteryFilter"><option value="">All Lotteries</option>${lotteryOptions}</select>
            </div>
            <div class="filter-field">
              <label>From Date</label>
              <input type="date" id="soldFromDate">
            </div>
            <div class="filter-field">
              <label>To Date</label>
              <input type="date" id="soldToDate">
            </div>
            <div>
              <button class="btn btn-gradient btn-sm" id="searchSoldBtn">
                <i class="fas fa-search"></i> Search
              </button>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>Ticket ID</th><th>Lottery</th><th>Buyer</th><th>Price</th><th>Seller</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody id="soldTableBody">
              <tr><td colspan="7" class="table-empty">Apply filters and click Search.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    this._bindScopeToggles();
    document.getElementById('searchSoldBtn').addEventListener('click', () => this._load());
    this._load(); /* default: load all */
  },

  _bindScopeToggles() {
    const radios = document.querySelectorAll('input[name="soldScope"]');
    radios.forEach(r => r.addEventListener('change', () => {
      const val = r.value;
      document.getElementById('soldSellerDiv').style.display     = val === 'seller'     ? 'block' : 'none';
      document.getElementById('soldSupervisorDiv').style.display = val === 'supervisor' ? 'block' : 'none';
    }));
  },

  _load() {
    const scope    = document.querySelector('input[name="soldScope"]:checked')?.value;
    const seller   = document.getElementById('soldSellerSelect')?.value;
    const sup      = document.getElementById('soldSupervisorSelect')?.value;
    const lottery  = document.getElementById('soldLotteryFilter')?.value;
    const fromDate = document.getElementById('soldFromDate')?.value;
    const toDate   = document.getElementById('soldToDate')?.value;

    if (scope === 'seller'     && !seller) { App.Utils.toast('Please select a seller.', 'error'); return; }
    if (scope === 'supervisor' && !sup)    { App.Utils.toast('Please select a supervisor.', 'error'); return; }

    const tbody = document.getElementById('soldTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(7);

    App.Api.getSoldTickets({
      lottery,
      fromDate,
      toDate,
      seller:     scope === 'seller'     ? seller : '',
      supervisor: scope === 'supervisor' ? sup    : '',
    }).then(tickets => {
      if (!tickets.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No tickets found.', 7);
        return;
      }
      tbody.innerHTML = tickets.map(t => `
        <tr>
          <td><code>${App.Utils.escHtml(t.id)}</code></td>
          <td>${App.Utils.escHtml(t.lottery)}</td>
          <td>${App.Utils.escHtml(t.buyer)}</td>
          <td>${App.Utils.formatMoney(t.price)}</td>
          <td>${App.Utils.escHtml(t.seller)}</td>
          <td>${App.Utils.formatDate(t.date)}</td>
          <td>${App.Utils.badge(t.status, t.status === 'active' ? 'success' : 'neutral')}</td>
        </tr>
      `).join('');
    });
  },
};
