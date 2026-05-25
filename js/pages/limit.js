/* =====================================================================
   PRINCE LOTO — Limits Page
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Limit = {
  _context: 'all',
  _entity:  null,

  render() {
    const lotteryOptions = App.Data.lotteries.map(l => `<option value="${App.Utils.escHtml(l)}">${App.Utils.escHtml(l)}</option>`).join('');
    const sellerOptions  = App.Data.sellers.map(s => `<option value="${App.Utils.escHtml(s.name)}">${App.Utils.escHtml(s.name)}</option>`).join('');
    const supOptions     = App.Data.supervisors.map(s => `<option value="${App.Utils.escHtml(s.name)}">${App.Utils.escHtml(s.name)}</option>`).join('');

    return `
      <div class="page-card">
        <h2><i class="fas fa-sliders-h"></i> Category Limits (Limites)</h2>

        <div class="filter-card">
          <div class="filter-title"><i class="fas fa-tag"></i> Scope & Lottery</div>

          <div class="radio-group">
            <label><input type="radio" name="limitScope" value="all" checked> Global</label>
            <label><input type="radio" name="limitScope" value="seller"> By Seller</label>
            <label><input type="radio" name="limitScope" value="supervisor"> By Supervisor</label>
          </div>

          <div id="limitSellerDiv" style="display:none; margin-bottom:12px;">
            <div class="filter-field">
              <label>Seller</label>
              <select id="limitSellerSelect"><option value="">-- Select seller --</option>${sellerOptions}</select>
            </div>
          </div>
          <div id="limitSupervisorDiv" style="display:none; margin-bottom:12px;">
            <div class="filter-field">
              <label>Supervisor</label>
              <select id="limitSupervisorSelect"><option value="">-- Select supervisor --</option>${supOptions}</select>
            </div>
          </div>

          <div class="filter-grid">
            <div class="filter-field">
              <label>Lottery</label>
              <select id="limitLotterySelect">${lotteryOptions}</select>
            </div>
            <div>
              <button class="btn btn-gradient btn-sm" id="limitShowBtn">
                <i class="fas fa-eye"></i> Show Limits
              </button>
            </div>
          </div>
        </div>

        <div id="limitTableContainer"></div>
      </div>
    `;
  },

  init() {
    this._context = 'all';
    this._entity  = null;
    this._bindScopeToggles();
    document.getElementById('limitShowBtn').addEventListener('click', () => this._load());
    this._load();
  },

  _bindScopeToggles() {
    const radios = document.querySelectorAll('input[name="limitScope"]');
    radios.forEach(r => r.addEventListener('change', () => {
      const val = r.value;
      document.getElementById('limitSellerDiv').style.display     = val === 'seller'     ? 'block' : 'none';
      document.getElementById('limitSupervisorDiv').style.display = val === 'supervisor' ? 'block' : 'none';
      this._context = val;
      this._entity  = null;
    }));
    document.getElementById('limitSellerSelect').addEventListener('change', (e) => {
      this._entity = e.target.value || null;
    });
    document.getElementById('limitSupervisorSelect').addEventListener('change', (e) => {
      this._entity = e.target.value || null;
    });
  },

  _load() {
    const lottery = document.getElementById('limitLotterySelect').value;
    if (!lottery) return;

    if (this._context === 'seller'     && !this._entity) { App.Utils.toast('Please select a seller.', 'error'); return; }
    if (this._context === 'supervisor' && !this._entity) { App.Utils.toast('Please select a supervisor.', 'error'); return; }

    const container = document.getElementById('limitTableContainer');
    container.innerHTML = `<div class="table-wrapper"><table class="data-table"><tbody>${App.Utils.tableLoadingRow(2)}</tbody></table></div>`;

    App.Api.getLimits(lottery, this._context, this._entity).then(limitObj => {
      this._renderTable(container, lottery, limitObj);
    });
  },

  _renderTable(container, lottery, limitObj) {
    const contextLabel = this._context === 'all'
      ? 'Global'
      : this._context === 'seller'
        ? `Seller: ${this._entity}`
        : `Supervisor: ${this._entity}`;

    const rows = App.Data.limitCategories.map(cat => `
      <tr>
        <td><strong>${App.Utils.escHtml(cat)}</strong></td>
        <td><input type="number" class="prize-input" data-cat="${cat}" value="${limitObj[cat] || 0}" step="100"></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="current-lottery-badge">
        <i class="fas fa-sliders-h"></i> ${App.Utils.escHtml(lottery)} — ${App.Utils.escHtml(contextLabel)}
      </div>
      <div class="table-wrapper">
        <table class="data-table" id="limitTable">
          <thead><tr><th>Category</th><th>Limit Amount ($)</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div style="margin-top:20px;">
        <button class="btn btn-gradient" id="saveLimitsBtn"><i class="fas fa-save"></i> Save Limits</button>
      </div>
    `;

    document.getElementById('saveLimitsBtn').addEventListener('click', () => {
      const updated = {};
      document.querySelectorAll('#limitTable .prize-input').forEach(inp => {
        updated[inp.dataset.cat] = parseFloat(inp.value) || 0;
      });
      const saveBtn = document.getElementById('saveLimitsBtn');
      saveBtn.disabled = true;

      App.Api.saveLimits(lottery, updated, this._context, this._entity).then(() => {
        App.Utils.toast('Limits saved successfully.');
      }).finally(() => { saveBtn.disabled = false; });
    });
  },
};
