/* =====================================================================
   PRINCE LOTO — Winning Tickets Page  (Sub-Admin only)
   Real API: GET /api/subadmin/getwintickets?fromDate=&toDate=&lotteryCategoryName=&seller=
   Response: { success, data: [{ ticketId, date, lotteryCategoryName, seller, numbers, paidAmount }] }
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.WinTickets = {
  _sellers:   [],
  _lotteries: [],

  render() {
    return `
      <div class="page-card">
        <h2><i class="fas fa-trophy"></i> Winning Tickets (Tickets Gagnants)</h2>

        <div class="filter-card">
          <div class="filter-title"><i class="fas fa-filter"></i> Filters</div>
          <div class="filter-grid">
            <div class="filter-field">
              <label>Seller</label>
              <select id="winSellerSelect">
                <option value="">All Sellers</option>
              </select>
            </div>
            <div class="filter-field">
              <label>Lottery</label>
              <select id="winLotteryFilter">
                <option value="">All Lotteries</option>
              </select>
            </div>
            <div class="filter-field">
              <label>From Date</label>
              <input type="date" id="winFromDate">
            </div>
            <div class="filter-field">
              <label>To Date</label>
              <input type="date" id="winToDate">
            </div>
            <div style="display:flex; align-items:flex-end;">
              <button class="btn btn-gradient btn-sm" id="searchWinBtn">
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
                <th style="text-align:right">Paid Amount</th>
                <th>Winning Numbers</th>
              </tr>
            </thead>
            <tbody id="winTableBody">
              <tr><td colspan="6" class="table-empty">Apply filters and click Search.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    Promise.all([
      App.Api.getSellers().catch(() => ({ users: [] })),
      App.Api.getLotteryCategories().catch(() => []),
    ]).then(([sellerResp, lotteries]) => {
      this._sellers   = Array.isArray(sellerResp.users) ? sellerResp.users : [];
      this._lotteries = Array.isArray(lotteries) ? lotteries : [];

      const selSel = document.getElementById('winSellerSelect');
      if (selSel) {
        selSel.innerHTML = '<option value="">All Sellers</option>' +
          this._sellers.map(s => `<option value="${App.Utils.escHtml(s.userName)}">${App.Utils.escHtml(s.userName)}</option>`).join('');
      }

      const lotSel = document.getElementById('winLotteryFilter');
      if (lotSel) {
        lotSel.innerHTML = '<option value="">All Lotteries</option>' +
          this._lotteries.map(l => `<option value="${App.Utils.escHtml(l.lotteryName)}">${App.Utils.escHtml(l.lotteryName)}</option>`).join('');
      }
    });

    document.getElementById('searchWinBtn').addEventListener('click', () => this._load());
  },

  _load() {
    const seller   = document.getElementById('winSellerSelect')?.value   || '';
    const lottery  = document.getElementById('winLotteryFilter')?.value  || '';
    const fromDate = document.getElementById('winFromDate')?.value        || '';
    const toDate   = document.getElementById('winToDate')?.value          || '';

    const tbody = document.getElementById('winTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(6);

    App.Api.getWinningTickets({ seller, lottery, fromDate, toDate }).then(tickets => {
      if (!tickets || !tickets.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No winning tickets found.', 6);
        return;
      }

      tbody.innerHTML = tickets.map(t => {
        const winNums = Array.isArray(t.numbers)
          ? t.numbers.filter(n => n.winFlag)
              .map(n => `<span style="display:inline-block;background:var(--clr-gold-100,#fff8e1);border:1px solid var(--clr-gold-400,#f0c040);border-radius:4px;padding:1px 6px;font-size:0.78rem;margin:1px;">${App.Utils.escHtml(n.gameCategory||'')} ${App.Utils.escHtml(n.number||'')}</span>`)
              .join(' ')
          : '—';
        return `
          <tr>
            <td><code style="font-size:0.8rem">${App.Utils.escHtml(t.ticketId || '—')}</code></td>
            <td>${App.Utils.escHtml(t.lotteryCategoryName || '—')}</td>
            <td>${App.Utils.escHtml(t.seller || '—')}</td>
            <td>${App.Utils.formatDate(t.date)}</td>
            <td style="text-align:right; color:var(--clr-text-green); font-weight:700">
              ${App.Utils.formatMoney(t.paidAmount || 0)}
            </td>
            <td>${winNums || '—'}</td>
          </tr>
        `;
      }).join('');
    }).catch(err => {
      tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load winning tickets.', 6);
      App.Utils.toast(err.message || 'Error loading data.', 'error');
    });
  },
};

