/* =====================================================================
   PRINCE LOTO — Sales Reports Page  (Sub-Admin only)
   Real API: GET /api/subadmin/getsalereports
     ?fromDate=&toDate=&lotteryCategoryName=csv&seller=id&supervisor=id
   Response: { success, data: { sellerName: { name, sum, paid } } }
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Reports = {
  _sellers:     [],
  _supervisors: [],
  _lotteries:   [],
  _allEntries:  [],   // flat array of { name, sum, paid }
  _page:        1,
  _PAGE_SIZE:   50,

  render() {
    return `
      <div class="page-card">
        <h2><i class="fas fa-chart-line"></i> Sales Reports</h2>

        <!-- Filters -->
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
              <label>Supervisor</label>
              <select id="reportSupervisorSelect">
                <option value="">All Supervisors</option>
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

          </div>

          <!-- Lottery checkboxes -->
          <div style="margin-top:12px;">
            <label style="font-weight:600; font-size:0.85rem; display:block; margin-bottom:6px;">
              Lotteries <span style="font-weight:400; color:var(--clr-warm-500)">(leave unchecked for all)</span>
            </label>
            <div id="reportLotteryChecks" style="display:flex; flex-wrap:wrap; gap:8px 20px; margin-bottom:8px;">
              <span style="color:var(--clr-warm-400); font-size:0.85rem;">Loading...</span>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-ghost btn-sm" id="checkAllLotBtn" style="font-size:0.78rem; padding:4px 10px;">
                <i class="fas fa-check-square"></i> All
              </button>
              <button class="btn btn-ghost btn-sm" id="uncheckAllLotBtn" style="font-size:0.78rem; padding:4px 10px;">
                <i class="far fa-square"></i> None
              </button>
            </div>
          </div>

          <div style="margin-top:14px;">
            <button class="btn btn-gradient btn-sm" id="searchReportBtn">
              <i class="fas fa-search"></i> Generate Report
            </button>
          </div>
        </div>

        <!-- Summary -->
        <div id="reportSummary" style="display:none; margin-bottom:12px; padding:12px 16px;
            background:var(--clr-warm-100); border-radius:var(--radius-md);
            gap:24px; flex-wrap:wrap; align-items:center;">
          <span><strong>Total Sales:</strong> <span id="reportTotalSales">—</span></span>
          <span><strong>Paid Out:</strong>    <span id="reportTotalPaid">—</span></span>
          <span><strong>Profit:</strong>      <span id="reportTotalProfit" style="color:var(--clr-text-green)">—</span></span>
          <span style="margin-left:auto; color:var(--clr-warm-500); font-size:0.85rem;">
            <span id="reportRowCount">0</span> seller(s) found
          </span>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Seller</th>
                <th style="text-align:right">Total Sales</th>
                <th style="text-align:right">Paid Out</th>
                <th style="text-align:right">Profit</th>
              </tr>
            </thead>
            <tbody id="reportTableBody">
              <tr><td colspan="5" class="table-empty">Apply filters and click Generate Report.</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div id="reportPagination" style="display:none; margin-top:12px; justify-content:center; align-items:center; gap:8px;"></div>
      </div>
    `;
  },

  init() {
    this._allEntries = [];
    this._page = 1;

    // Default dates: today
    const today = new Date().toISOString().slice(0, 10);
    const fromEl = document.getElementById('reportFromDate');
    const toEl   = document.getElementById('reportToDate');
    if (fromEl && !fromEl.value) fromEl.value = today;
    if (toEl   && !toEl.value)   toEl.value   = today;

    // Load dropdown data
    Promise.all([
      App.Api.getSellers().catch(() => ({ users: [] })),
      App.Api.getSupervisors().catch(() => []),
      App.Api.getLotteryCategories().catch(() => []),
    ]).then(([sellerResp, supervisors, lotteries]) => {
      this._sellers     = Array.isArray(sellerResp.users) ? sellerResp.users : [];
      this._supervisors = Array.isArray(supervisors)      ? supervisors      : [];
      this._lotteries   = Array.isArray(lotteries)        ? lotteries        : [];

      // Seller dropdown — value is _id (not userName)
      const selSel = document.getElementById('reportSellerSelect');
      if (selSel) {
        selSel.innerHTML = '<option value="">All Sellers</option>' +
          this._sellers.map(s =>
            `<option value="${App.Utils.escHtml(s._id)}">${App.Utils.escHtml(s.userName)}</option>`
          ).join('');
      }

      // Supervisor dropdown
      const supSel = document.getElementById('reportSupervisorSelect');
      if (supSel) {
        supSel.innerHTML = '<option value="">All Supervisors</option>' +
          this._supervisors.map(s =>
            `<option value="${App.Utils.escHtml(s._id)}">${App.Utils.escHtml(s.userName)}</option>`
          ).join('');
      }

      // Lottery checkboxes
      const checksWrap = document.getElementById('reportLotteryChecks');
      if (checksWrap) {
        if (this._lotteries.length) {
          checksWrap.innerHTML = this._lotteries.map(l => `
            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:0.85rem;white-space:nowrap;">
              <input type="checkbox" class="lot-check" value="${App.Utils.escHtml(l.lotteryName)}">
              ${App.Utils.escHtml(l.lotteryName)}
            </label>
          `).join('');
        } else {
          checksWrap.innerHTML = '<span style="color:var(--clr-warm-400);font-size:0.85rem;">No lotteries found.</span>';
        }
      }
    });

    // Selecting a specific seller clears supervisor and vice versa
    document.getElementById('reportSellerSelect')?.addEventListener('change', e => {
      if (e.target.value) document.getElementById('reportSupervisorSelect').value = '';
    });
    document.getElementById('reportSupervisorSelect')?.addEventListener('change', e => {
      if (e.target.value) document.getElementById('reportSellerSelect').value = '';
    });

    document.getElementById('checkAllLotBtn')?.addEventListener('click', () => {
      document.querySelectorAll('.lot-check').forEach(cb => { cb.checked = true; });
    });
    document.getElementById('uncheckAllLotBtn')?.addEventListener('click', () => {
      document.querySelectorAll('.lot-check').forEach(cb => { cb.checked = false; });
    });

    document.getElementById('searchReportBtn').addEventListener('click', () => {
      this._page = 1;
      this._load();
    });
  },

  _load() {
    const seller     = document.getElementById('reportSellerSelect')?.value    || '';
    const supervisor = document.getElementById('reportSupervisorSelect')?.value || '';
    const fromDate   = document.getElementById('reportFromDate')?.value          || '';
    const toDate     = document.getElementById('reportToDate')?.value            || '';

    // Collect checked lottery names — empty string means "all"
    const checkedLots = Array.from(document.querySelectorAll('.lot-check:checked'))
      .map(cb => cb.value);
    const lotteries = checkedLots.join(',');

    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(5);
    document.getElementById('reportSummary').style.display    = 'none';
    document.getElementById('reportPagination').style.display = 'none';

    App.Api.getSalesReport({ seller, supervisor, fromDate, toDate, lotteries }).then(data => {
      this._allEntries = Object.values(data || {});

      if (!this._allEntries.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No sales records match the filters.', 5);
        return;
      }

      // Grand totals
      let grandSum = 0, grandPaid = 0;
      this._allEntries.forEach(r => { grandSum += r.sum || 0; grandPaid += r.paid || 0; });

      // Summary bar
      const summaryEl = document.getElementById('reportSummary');
      summaryEl.style.display = 'flex';
      document.getElementById('reportTotalSales').textContent = App.Utils.formatMoney(grandSum);
      document.getElementById('reportTotalPaid').textContent  = App.Utils.formatMoney(grandPaid);
      const grandProfit = grandSum - grandPaid;
      const profitEl = document.getElementById('reportTotalProfit');
      profitEl.textContent = App.Utils.formatMoney(grandProfit);
      profitEl.style.color = grandProfit >= 0 ? 'var(--clr-text-green)' : 'var(--clr-danger)';
      document.getElementById('reportRowCount').textContent = this._allEntries.length;

      this._renderTable();
    }).catch(err => {
      tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load report.', 5);
      App.Utils.toast(err.message || 'Error loading report.', 'error');
    });
  },

  _renderTable() {
    const tbody = document.getElementById('reportTableBody');
    const pagEl = document.getElementById('reportPagination');
    const total = this._allEntries.length;
    const pages = Math.ceil(total / this._PAGE_SIZE);
    const page  = Math.max(1, Math.min(this._page, pages));
    const start = (page - 1) * this._PAGE_SIZE;
    const slice = this._allEntries.slice(start, start + this._PAGE_SIZE);

    tbody.innerHTML = slice.map((r, i) => {
      const sum    = r.sum  || 0;
      const paid   = r.paid || 0;
      const profit = sum - paid;
      return `
        <tr>
          <td style="color:var(--clr-warm-400);font-size:0.85rem">${start + i + 1}</td>
          <td><strong>${App.Utils.escHtml(r.name || '—')}</strong></td>
          <td style="text-align:right">${App.Utils.formatMoney(sum)}</td>
          <td style="text-align:right">${App.Utils.formatMoney(paid)}</td>
          <td style="text-align:right;color:${profit >= 0 ? 'var(--clr-text-green)' : 'var(--clr-danger)'}">
            <strong>${App.Utils.formatMoney(profit)}</strong>
          </td>
        </tr>
      `;
    }).join('');

    // Pagination
    if (pages <= 1) {
      pagEl.style.display = 'none';
      return;
    }
    pagEl.style.display = 'flex';
    pagEl.innerHTML = `
      <button class="btn btn-ghost btn-sm" id="repPrevBtn" ${page <= 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i> Prev
      </button>
      <span style="font-size:0.9rem; padding:0 10px; align-self:center;">
        Page ${page} of ${pages}
      </span>
      <button class="btn btn-ghost btn-sm" id="repNextBtn" ${page >= pages ? 'disabled' : ''}>
        Next <i class="fas fa-chevron-right"></i>
      </button>
    `;
    document.getElementById('repPrevBtn')?.addEventListener('click', () => {
      if (this._page > 1) { this._page--; this._renderTable(); }
    });
    document.getElementById('repNextBtn')?.addEventListener('click', () => {
      if (this._page < pages) { this._page++; this._renderTable(); }
    });
  },
};


