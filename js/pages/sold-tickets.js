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

