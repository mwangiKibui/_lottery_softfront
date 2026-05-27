/* =====================================================================
   PRINCE LOTO — Sold Tickets Page  (Sub-Admin only)
   Real API: GET /api/subadmin/gettickets?fromDate=&toDate=&lotteryCategoryName=&seller=
   Response: { success, data: [{ _id, ticketId, seller, lotteryCategoryName, date, isDelete, numbers }] }
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.SoldTickets = {
  _sellers:   [],
  _lotteries: [],
  _sellerMap: {},   // _id → userName

  render() {
    return `
      <div class="page-card">
        <h2><i class="fas fa-receipt"></i> Sold Tickets (Tickets Vendus)</h2>

        <div class="filter-card">
          <div class="filter-title"><i class="fas fa-filter"></i> Filters</div>
          <div class="filter-grid">
            <div class="filter-field">
              <label>Seller</label>
              <select id="soldSellerSelect">
                <option value="">All Sellers</option>
              </select>
            </div>
            <div class="filter-field">
              <label>Lottery</label>
              <select id="soldLotteryFilter">
                <option value="">All Lotteries</option>
              </select>
            </div>
            <div class="filter-field">
              <label>From Date</label>
              <input type="date" id="soldFromDate">
            </div>
            <div class="filter-field">
              <label>To Date</label>
              <input type="date" id="soldToDate">
            </div>
            <div style="display:flex; align-items:flex-end;">
              <button class="btn btn-gradient btn-sm" id="searchSoldBtn">
                <i class="fas fa-search"></i> Search
              </button>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Lottery</th>
                <th>Seller</th>
                <th>Date</th>
                <th>Numbers</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="soldTableBody">
              <tr><td colspan="6" class="table-empty">Apply filters and click Search.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    // Load filter dropdowns
    Promise.all([
      App.Api.getSellers().catch(() => ({ users: [] })),
      App.Api.getLotteryCategories().catch(() => []),
    ]).then(([sellerResp, lotteries]) => {
      this._sellers   = Array.isArray(sellerResp.users) ? sellerResp.users : [];
      this._lotteries = Array.isArray(lotteries) ? lotteries : [];

      // Build lookup map
      this._sellerMap = {};
      this._sellers.forEach(s => { this._sellerMap[s._id] = s.userName; });

      const selSel = document.getElementById('soldSellerSelect');
      if (selSel) {
        selSel.innerHTML = '<option value="">All Sellers</option>' +
          this._sellers.map(s => `<option value="${App.Utils.escHtml(s._id)}">${App.Utils.escHtml(s.userName)}</option>`).join('');
      }

      const lotSel = document.getElementById('soldLotteryFilter');
      if (lotSel) {
        lotSel.innerHTML = '<option value="">All Lotteries</option>' +
          this._lotteries.map(l => `<option value="${App.Utils.escHtml(l.lotteryName)}">${App.Utils.escHtml(l.lotteryName)}</option>`).join('');
      }
    });

    document.getElementById('searchSoldBtn').addEventListener('click', () => this._load());
  },

  _load() {
    const seller   = document.getElementById('soldSellerSelect')?.value   || '';
    const lottery  = document.getElementById('soldLotteryFilter')?.value  || '';
    const fromDate = document.getElementById('soldFromDate')?.value        || '';
    const toDate   = document.getElementById('soldToDate')?.value          || '';

    const tbody = document.getElementById('soldTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(6);

    App.Api.getSoldTickets({ seller, lottery, fromDate, toDate }).then(tickets => {
      if (!tickets || !tickets.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No tickets found for these filters.', 6);
        return;
      }

      tbody.innerHTML = tickets.map(t => {
        const sellerName = this._sellerMap[t.seller] || t.seller || '—';
        const numsSummary = Array.isArray(t.numbers) && t.numbers.length
          ? t.numbers.map(n => `${App.Utils.escHtml(n.gameCategory || '')} ${App.Utils.escHtml(n.number || '')}`).join(', ')
          : '—';
        const isDeleted = t.isDelete ? 'Deleted' : 'Active';
        return `
          <tr class="${t.isDelete ? 'row-muted' : ''}">
            <td><code style="font-size:0.8rem">${App.Utils.escHtml(t.ticketId || t._id)}</code></td>
            <td>${App.Utils.escHtml(t.lotteryCategoryName || '—')}</td>
            <td>${App.Utils.escHtml(sellerName)}</td>
            <td>${App.Utils.formatDate(t.date)}</td>
            <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:0.82rem;"
                title="${App.Utils.escHtml(numsSummary)}">${App.Utils.escHtml(numsSummary)}</td>
            <td>${App.Utils.badge(isDeleted, t.isDelete ? 'neutral' : 'success')}</td>
          </tr>
        `;
      }).join('');
    }).catch(err => {
      tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load tickets.', 6);
      App.Utils.toast(err.message || 'Error loading tickets.', 'error');
    });
  },
};


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
