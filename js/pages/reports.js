/* =====================================================================
   PRINCE LOTO — Sales Reports Page  (Sub-Admin only)
   Real API: GET /api/subadmin/getsalereports
   Response: { success, data: { sellerName: { name, sum, paid } } }
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Reports = {
  _sellers:  [],
  _lotteries: [],

  render() {
    return `
      <div class="page-card">
        <h2><i class="fas fa-chart-line"></i> Sales Reports</h2>

        <div class="filter-card">
          <div class="filter-title"><i class="fas fa-filter"></i> Filters</div>
          <div class="filter-grid">
            <div class="filter-field">
              <label>Seller</label>
              <select id="reportSellerSelect">
                <option value="">All Sellers</option>
              </select>
            </div>
            <div class="filter-field">
              <label>Lottery</label>
              <select id="reportLotteryFilter">
                <option value="">All Lotteries</option>
              </select>
            </div>
            <div class="filter-field">
              <label>From Date</label>
              <input type="date" id="reportFromDate">
            </div>
            <div class="filter-field">
              <label>To Date</label>
              <input type="date" id="reportToDate">
            </div>
            <div style="display:flex; align-items:flex-end;">
              <button class="btn btn-gradient btn-sm" id="searchReportBtn">
                <i class="fas fa-search"></i> Generate Report
              </button>
            </div>
          </div>
        </div>

        <!-- Summary row -->
        <div id="reportSummary" style="display:none; margin-bottom:12px; padding:12px 16px; background:var(--clr-warm-100); border-radius:var(--radius-md); display:flex; gap:24px; flex-wrap:wrap;">
          <span><strong>Total Sales:</strong> <span id="reportTotalSales">—</span></span>
          <span><strong>Paid Out:</strong> <span id="reportTotalPaid">—</span></span>
          <span><strong>Profit:</strong> <span id="reportTotalProfit" style="color:var(--clr-text-green)">—</span></span>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th style="text-align:right">Total Sales</th>
                <th style="text-align:right">Paid Out</th>
                <th style="text-align:right">Profit</th>
              </tr>
            </thead>
            <tbody id="reportTableBody">
              <tr><td colspan="4" class="table-empty">Apply filters and click Generate Report.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    // Load dropdown data
    Promise.all([
      App.Api.getSellers().catch(() => ({ users: [] })),
      App.Api.getLotteryCategories().catch(() => []),
    ]).then(([sellerResp, lotteries]) => {
      this._sellers  = Array.isArray(sellerResp.users) ? sellerResp.users : [];
      this._lotteries = Array.isArray(lotteries) ? lotteries : [];

      const selSel = document.getElementById('reportSellerSelect');
      if (selSel) {
        selSel.innerHTML = '<option value="">All Sellers</option>' +
          this._sellers.map(s => `<option value="${App.Utils.escHtml(s.userName)}">${App.Utils.escHtml(s.userName)}</option>`).join('');
      }

      const lotSel = document.getElementById('reportLotteryFilter');
      if (lotSel) {
        lotSel.innerHTML = '<option value="">All Lotteries</option>' +
          this._lotteries.map(l => `<option value="${App.Utils.escHtml(l.lotteryName)}">${App.Utils.escHtml(l.lotteryName)}</option>`).join('');
      }
    });

    document.getElementById('searchReportBtn').addEventListener('click', () => this._load());
  },

  _load() {
    const seller   = document.getElementById('reportSellerSelect')?.value    || '';
    const lottery  = document.getElementById('reportLotteryFilter')?.value   || '';
    const fromDate = document.getElementById('reportFromDate')?.value         || '';
    const toDate   = document.getElementById('reportToDate')?.value           || '';

    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(4);

    App.Api.getSalesReport({ seller, lottery, fromDate, toDate }).then(data => {
      // data = { sellerName: { name, sum, paid } }
      const entries = Object.values(data || {});

      if (!entries.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No sales records match the filters.', 4);
        document.getElementById('reportSummary').style.display = 'none';
        return;
      }

      let grandSum = 0, grandPaid = 0;

      tbody.innerHTML = entries.map(r => {
        const sum    = r.sum  || 0;
        const paid   = r.paid || 0;
        const profit = sum - paid;
        grandSum  += sum;
        grandPaid += paid;
        return `
          <tr>
            <td><strong>${App.Utils.escHtml(r.name || '—')}</strong></td>
            <td style="text-align:right">${App.Utils.formatMoney(sum)}</td>
            <td style="text-align:right">${App.Utils.formatMoney(paid)}</td>
            <td style="text-align:right; color:${profit >= 0 ? 'var(--clr-text-green)' : 'var(--clr-danger)'}">
              <strong>${App.Utils.formatMoney(profit)}</strong>
            </td>
          </tr>
        `;
      }).join('');

      // Show summary
      const summaryEl = document.getElementById('reportSummary');
      summaryEl.style.display = 'flex';
      document.getElementById('reportTotalSales').textContent  = App.Utils.formatMoney(grandSum);
      document.getElementById('reportTotalPaid').textContent   = App.Utils.formatMoney(grandPaid);
      const grandProfit = grandSum - grandPaid;
      const profitEl = document.getElementById('reportTotalProfit');
      profitEl.textContent = App.Utils.formatMoney(grandProfit);
      profitEl.style.color = grandProfit >= 0 ? 'var(--clr-text-green)' : 'var(--clr-danger)';
    }).catch(err => {
      tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load report.', 4);
      App.Utils.toast(err.message || 'Error loading report.', 'error');
    });
  },
};


App.Pages.Reports = {
  render() {
    const sellerOptions    = App.Data.sellers.map(s => `<option value="${App.Utils.escHtml(s.name)}">${App.Utils.escHtml(s.name)}</option>`).join('');
    const supOptions       = App.Data.supervisors.map(s => `<option value="${App.Utils.escHtml(s.name)}">${App.Utils.escHtml(s.name)}</option>`).join('');
    const lotteryOptions   = App.Data.lotteries.map(l => `<option value="${App.Utils.escHtml(l)}">${App.Utils.escHtml(l)}</option>`).join('');

    return `
      <div class="page-card">
        <h2><i class="fas fa-chart-line"></i> Sales Reports</h2>

        <div class="filter-card">
          <div class="filter-title"><i class="fas fa-filter"></i> Filters</div>

          <!-- Scope -->
          <div class="radio-group">
            <label><input type="radio" name="reportScope" value="all" checked> All</label>
            <label><input type="radio" name="reportScope" value="seller"> By Seller</label>
            <label><input type="radio" name="reportScope" value="supervisor"> By Supervisor</label>
          </div>

          <div id="reportSellerDiv" style="display:none; margin-bottom:12px;">
            <div class="filter-field">
              <label>Seller</label>
              <select id="reportSellerSelect"><option value="">-- Select seller --</option>${sellerOptions}</select>
            </div>
          </div>
          <div id="reportSupervisorDiv" style="display:none; margin-bottom:12px;">
            <div class="filter-field">
              <label>Supervisor</label>
              <select id="reportSupervisorSelect"><option value="">-- Select supervisor --</option>${supOptions}</select>
            </div>
          </div>

          <div class="filter-grid">
            <div class="filter-field">
              <label>Lottery</label>
              <select id="reportLotteryFilter"><option value="">All Lotteries</option>${lotteryOptions}</select>
            </div>
            <div class="filter-field">
              <label>From Date</label>
              <input type="date" id="reportFromDate">
            </div>
            <div class="filter-field">
              <label>To Date</label>
              <input type="date" id="reportToDate">
            </div>
            <div>
              <button class="btn btn-gradient btn-sm" id="searchReportBtn">
                <i class="fas fa-search"></i> Generate Report
              </button>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table" id="reportTable">
            <thead>
              <tr><th>Seller</th><th>Lottery</th><th>Date</th><th>Amount</th></tr>
            </thead>
            <tbody id="reportTableBody">
              <tr><td colspan="4" class="table-empty">Apply filters and click Generate Report.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init() {
    this._bindScopeToggles('report');
    document.getElementById('searchReportBtn').addEventListener('click', () => this._load());
  },

  _bindScopeToggles(prefix) {
    const radioAll = document.querySelector(`input[name="${prefix}Scope"][value="all"]`);
    const radioSeller = document.querySelector(`input[name="${prefix}Scope"][value="seller"]`);
    const radioSup    = document.querySelector(`input[name="${prefix}Scope"][value="supervisor"]`);
    const sellerDiv   = document.getElementById(`${prefix}SellerDiv`);
    const supDiv      = document.getElementById(`${prefix}SupervisorDiv`);

    const update = () => {
      sellerDiv.style.display = radioSeller?.checked ? 'block' : 'none';
      supDiv.style.display    = radioSup?.checked    ? 'block' : 'none';
    };
    radioAll?.addEventListener('change', update);
    radioSeller?.addEventListener('change', update);
    radioSup?.addEventListener('change', update);
    update();
  },

  _load() {
    const scope      = document.querySelector('input[name="reportScope"]:checked')?.value;
    const sellerVal  = document.getElementById('reportSellerSelect')?.value;
    const supVal     = document.getElementById('reportSupervisorSelect')?.value;
    const lottery    = document.getElementById('reportLotteryFilter')?.value;
    const fromDate   = document.getElementById('reportFromDate')?.value;
    const toDate     = document.getElementById('reportToDate')?.value;

    if (scope === 'seller' && !sellerVal) { App.Utils.toast('Please select a seller.', 'error'); return; }
    if (scope === 'supervisor' && !supVal) { App.Utils.toast('Please select a supervisor.', 'error'); return; }

    const filters = {
      lottery,
      fromDate,
      toDate,
      seller:     scope === 'seller'     ? sellerVal : '',
      supervisor: scope === 'supervisor' ? supVal    : '',
    };

    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(4);

    App.Api.getSalesReport(filters).then(rows => {
      if (!rows.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No sales records match the filters.', 4);
        return;
      }
      tbody.innerHTML = rows.map(r => `
        <tr>
          <td>${App.Utils.escHtml(r.seller)}</td>
          <td>${App.Utils.escHtml(r.lottery)}</td>
          <td>${App.Utils.formatDate(r.date)}</td>
          <td><strong>${App.Utils.formatMoney(r.amount)}</strong></td>
        </tr>
      `).join('');
    });
  },
};
