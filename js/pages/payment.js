/* =====================================================================
   PRINCE LOTO — Payment Conditions Page
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Payment = {
  _context: 'all',
  _entity:  null,
  _positions: ['1st','2nd','3rd','4th','5th','6th','7th','8th'],

  render() {
    const lotteryOptions = App.Data.lotteries.map(l => `<option value="${App.Utils.escHtml(l)}">${App.Utils.escHtml(l)}</option>`).join('');
    const sellerOptions  = App.Data.sellers.map(s => `<option value="${App.Utils.escHtml(s.name)}">${App.Utils.escHtml(s.name)}</option>`).join('');
    const supOptions     = App.Data.supervisors.map(s => `<option value="${App.Utils.escHtml(s.name)}">${App.Utils.escHtml(s.name)}</option>`).join('');

    return `
      <div class="page-card">
        <h2><i class="fas fa-dollar-sign"></i> Prize Structure (Positions 1→8)</h2>

        <div class="filter-card">
          <div class="filter-title"><i class="fas fa-credit-card"></i> Scope & Lottery</div>

          <div class="radio-group">
            <label><input type="radio" name="paymentScope" value="all" checked> Global</label>
            <label><input type="radio" name="paymentScope" value="seller"> By Seller</label>
            <label><input type="radio" name="paymentScope" value="supervisor"> By Supervisor</label>
          </div>

          <div id="paySellerDiv" style="display:none; margin-bottom:12px;">
            <div class="filter-field">
              <label>Seller</label>
              <select id="paySellerSelect"><option value="">-- Select seller --</option>${sellerOptions}</select>
            </div>
          </div>
          <div id="paySupervisorDiv" style="display:none; margin-bottom:12px;">
            <div class="filter-field">
              <label>Supervisor</label>
              <select id="paySupervisorSelect"><option value="">-- Select supervisor --</option>${supOptions}</select>
            </div>
          </div>

          <div class="filter-grid">
            <div class="filter-field">
              <label>Lottery</label>
              <select id="payLotterySelect">${lotteryOptions}</select>
            </div>
            <div>
              <button class="btn btn-gradient btn-sm" id="payShowBtn">
                <i class="fas fa-eye"></i> Show Prizes
              </button>
            </div>
          </div>
        </div>

        <div id="payTableContainer"></div>
      </div>
    `;
  },

  init() {
    this._context = 'all';
    this._entity  = null;
    this._bindScopeToggles();
    document.getElementById('payShowBtn').addEventListener('click', () => this._load());
    /* Auto-load on open */
    this._load();
  },

  _bindScopeToggles() {
    const radios = document.querySelectorAll('input[name="paymentScope"]');
    radios.forEach(r => r.addEventListener('change', () => {
      const val = r.value;
      document.getElementById('paySellerDiv').style.display    = val === 'seller'     ? 'block' : 'none';
      document.getElementById('paySupervisorDiv').style.display= val === 'supervisor' ? 'block' : 'none';
      this._context = val;
      this._entity  = null;
    }));
    document.getElementById('paySellerSelect').addEventListener('change', (e) => {
      this._entity = e.target.value || null;
    });
    document.getElementById('paySupervisorSelect').addEventListener('change', (e) => {
      this._entity = e.target.value || null;
    });
  },

  _load() {
    const lottery = document.getElementById('payLotterySelect').value;
    if (!lottery) return;

    if (this._context === 'seller' && !this._entity)     { App.Utils.toast('Please select a seller.', 'error'); return; }
    if (this._context === 'supervisor' && !this._entity) { App.Utils.toast('Please select a supervisor.', 'error'); return; }

    const container = document.getElementById('payTableContainer');
    container.innerHTML = `<div class="table-wrapper"><table class="data-table"><tbody>${App.Utils.tableLoadingRow(2)}</tbody></table></div>`;

    App.Api.getPaymentConditions(lottery, this._context, this._entity).then(prizeObj => {
      this._renderTable(container, lottery, prizeObj);
    });
  },

  _renderTable(container, lottery, prizeObj) {
    const contextLabel = this._context === 'all'
      ? 'Global'
      : this._context === 'seller'
        ? `Seller: ${this._entity}`
        : `Supervisor: ${this._entity}`;

    const rows = this._positions.map(pos => `
      <tr>
        <td style="font-weight:600;">${pos}</td>
        <td><input type="number" class="prize-input" data-pos="${pos}" value="${prizeObj[pos] || 0}" step="50"></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="current-lottery-badge">
        <i class="fas fa-trophy"></i> ${App.Utils.escHtml(lottery)} — ${App.Utils.escHtml(contextLabel)}
      </div>
      <div class="table-wrapper">
        <table class="data-table" id="prizeTable">
          <thead><tr><th>Position</th><th>Prize Amount ($)</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div style="margin-top:20px;">
        <button class="btn btn-gradient" id="savePrizesBtn"><i class="fas fa-save"></i> Save Changes</button>
      </div>
    `;

    document.getElementById('savePrizesBtn').addEventListener('click', () => {
      const updated = {};
      document.querySelectorAll('#prizeTable .prize-input').forEach(inp => {
        updated[inp.dataset.pos] = parseFloat(inp.value) || 0;
      });
      const saveBtn = document.getElementById('savePrizesBtn');
      saveBtn.disabled = true;

      App.Api.savePaymentConditions(lottery, updated, this._context, this._entity).then(() => {
        App.Utils.toast('Prize structure saved successfully.');
      }).finally(() => { saveBtn.disabled = false; });
    });
  },
};
