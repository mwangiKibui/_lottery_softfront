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


App.Pages.WinTickets = {
  render() {
    const sellerOptions  = App.Data.sellers.map(s => `<option value="${App.Utils.escHtml(s.name)}">${App.Utils.escHtml(s.name)}</option>`).join('');
    const supOptions     = App.Data.supervisors.map(s => `<option value="${App.Utils.escHtml(s.name)}">${App.Utils.escHtml(s.name)}</option>`).join('');
    const lotteryOptions = App.Data.lotteries.map(l => `<option value="${App.Utils.escHtml(l)}">${App.Utils.escHtml(l)}</option>`).join('');

    return `
      <div class="page-card">
        <h2><i class="fas fa-trophy"></i> Winning Tickets (Tickets Gagnants)</h2>

        <div class="filter-card">
          <div class="filter-title"><i class="fas fa-filter"></i> Filters</div>

          <div class="radio-group">
            <label><input type="radio" name="winScope" value="all" checked> All</label>
            <label><input type="radio" name="winScope" value="seller"> By Seller</label>
            <label><input type="radio" name="winScope" value="supervisor"> By Supervisor</label>
          </div>

          <div id="winSellerDiv" style="display:none; margin-bottom:12px;">
            <div class="filter-field">
              <label>Seller</label>
              <select id="winSellerSelect"><option value="">-- Select seller --</option>${sellerOptions}</select>
            </div>
          </div>
          <div id="winSupervisorDiv" style="display:none; margin-bottom:12px;">
            <div class="filter-field">
              <label>Supervisor</label>
              <select id="winSupervisorSelect"><option value="">-- Select supervisor --</option>${supOptions}</select>
            </div>
          </div>

          <div class="filter-grid">
            <div class="filter-field">
              <label>Lottery</label>
              <select id="winLotteryFilter"><option value="">All Lotteries</option>${lotteryOptions}</select>
            </div>
            <div class="filter-field">
              <label>From Date</label>
              <input type="date" id="winFromDate">
            </div>
            <div class="filter-field">
              <label>To Date</label>
              <input type="date" id="winToDate">
            </div>
            <div>
              <button class="btn btn-gradient btn-sm" id="searchWinBtn">
                <i class="fas fa-search"></i> Search
              </button>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>Ticket #</th><th>Lottery</th><th>Prize</th><th>Winner</th><th>Seller</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody id="winTableBody">
              <tr><td colspan="7" class="table-empty">Apply filters and click Search.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    this._bindScopeToggles();
    document.getElementById('searchWinBtn').addEventListener('click', () => this._load());
    this._load();
  },

  _bindScopeToggles() {
    const radios = document.querySelectorAll('input[name="winScope"]');
    radios.forEach(r => r.addEventListener('change', () => {
      const val = r.value;
      document.getElementById('winSellerDiv').style.display     = val === 'seller'     ? 'block' : 'none';
      document.getElementById('winSupervisorDiv').style.display = val === 'supervisor' ? 'block' : 'none';
    }));
  },

  _load() {
    const scope    = document.querySelector('input[name="winScope"]:checked')?.value;
    const seller   = document.getElementById('winSellerSelect')?.value;
    const sup      = document.getElementById('winSupervisorSelect')?.value;
    const lottery  = document.getElementById('winLotteryFilter')?.value;
    const fromDate = document.getElementById('winFromDate')?.value;
    const toDate   = document.getElementById('winToDate')?.value;

    if (scope === 'seller'     && !seller) { App.Utils.toast('Please select a seller.', 'error'); return; }
    if (scope === 'supervisor' && !sup)    { App.Utils.toast('Please select a supervisor.', 'error'); return; }

    const tbody = document.getElementById('winTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(7);

    App.Api.getWinningTickets({
      lottery,
      fromDate,
      toDate,
      seller:     scope === 'seller'     ? seller : '',
      supervisor: scope === 'supervisor' ? sup    : '',
    }).then(tickets => {
      if (!tickets.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No winning tickets found.', 7);
        return;
      }
      tbody.innerHTML = tickets.map(w => `
        <tr>
          <td><code>${App.Utils.escHtml(w.ticket)}</code></td>
          <td>${App.Utils.escHtml(w.lottery)}</td>
          <td><strong>${App.Utils.formatMoney(w.prize)}</strong></td>
          <td>${App.Utils.escHtml(w.winner)}</td>
          <td>${App.Utils.escHtml(w.seller)}</td>
          <td>${App.Utils.formatDate(w.date)}</td>
          <td>${App.Utils.badge(w.status, w.status === 'paid' ? 'success' : 'warning')}</td>
        </tr>
      `).join('');
    });
  },
};
