/* =====================================================================
   PRINCE LOTO — Payment Terms Page  (Sub-Admin only)
   Real API: GET/POST/PATCH/DELETE /api/subadmin/*paymentterm*
   Term structure per lottery:
     { _id, lotteryCategoryName, conditions: [{gameCategory, position, condition}] }
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Payment = {
  _terms:      [],   // loaded payment terms
  _gameCats:   [],   // loaded game categories
  _lotteries:  [],   // loaded lottery categories
  _editingId:  null, // currently editing term id
  _editingLottery: '',

  render() {
    return `
      <div class="page-card">
        <div class="page-card-header">
          <h2><i class="fas fa-dollar-sign"></i> Payment Terms</h2>
          <button class="btn btn-gradient btn-sm" id="openPaymentModalBtn">
            <i class="fas fa-plus-circle"></i> New Term
          </button>
        </div>
        <hr class="divider">

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Lottery</th>
                <th>Game Category</th>
                <th>Position</th>
                <th>Multiplier (×)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="paymentTableBody">
              ${App.Utils.tableLoadingRow(5)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Payment Term Modal -->
      <div id="paymentModal" class="modal-overlay">
        <div class="modal-container" style="max-width:560px;">
          <div class="modal-header">
            <h3 id="paymentModalTitle"><i class="fas fa-dollar-sign"></i> New Payment Term</h3>
            <button class="modal-close" id="closePaymentModalBtn"><i class="fas fa-times"></i></button>
          </div>

          <div class="modal-grid" style="margin-bottom:12px;">
            <div class="form-group">
              <label>Lottery <span class="required">*</span></label>
              <select id="mPayLottery" ${''/* disabled on edit */}>
                <option value="">— Select Lottery —</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom:8px; font-weight:600; font-size:0.9rem;">Conditions</div>
          <div id="payConditionsContainer">
            <!-- rows inserted dynamically -->
          </div>
          <button class="btn btn-ghost btn-sm" id="addConditionRowBtn" style="margin-top:8px;">
            <i class="fas fa-plus"></i> Add Condition Row
          </button>

          <div class="modal-buttons" style="margin-top:20px;">
            <button class="btn btn-ghost" id="cancelPaymentModalBtn">Cancel</button>
            <button class="btn btn-primary" id="confirmPaymentBtn">
              <i class="fas fa-save"></i> Save
            </button>
          </div>
        </div>
      </div>

      <!-- Delete confirmation -->
      <div id="deletePaymentModal" class="modal-overlay">
        <div class="modal-container modal-sm">
          <div class="modal-header">
            <h3>Confirm Delete</h3>
            <button class="modal-close" id="closeDeletePaymentBtn"><i class="fas fa-times"></i></button>
          </div>
          <p style="margin:16px 0 24px;">Delete payment term for <strong id="deletePaymentLotteryLabel"></strong>?</p>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelDeletePaymentBtn">Cancel</button>
            <button class="btn btn-danger" id="confirmDeletePaymentBtn"><i class="fas fa-trash-alt"></i> Delete</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this._editingId = null;
    this._editingLottery = '';

    // Load data
    Promise.all([
      App.Api.getPaymentTerms().catch(() => []),
      App.Api.getGameCategories().catch(() => []),
      App.Api.getLotteryCategories().catch(() => []),
    ]).then(([terms, gameCats, lotteries]) => {
      this._terms     = Array.isArray(terms)     ? terms     : [];
      this._gameCats  = Array.isArray(gameCats)  ? gameCats  : [];
      this._lotteries = Array.isArray(lotteries) ? lotteries : [];
      this._renderTable();
      this._populateLotteryDropdown();
    });

    // Modal controls
    document.getElementById('openPaymentModalBtn').addEventListener('click', () => this._openCreate());
    ['closePaymentModalBtn','cancelPaymentModalBtn'].forEach(id =>
      document.getElementById(id).addEventListener('click', () => this._closeModal())
    );
    document.getElementById('paymentModal').addEventListener('click', e => {
      if (e.target === e.currentTarget) this._closeModal();
    });
    document.getElementById('confirmPaymentBtn').addEventListener('click', () => this._submit());
    document.getElementById('addConditionRowBtn').addEventListener('click', () => this._addConditionRow());

    // Delete modal
    ['closeDeletePaymentBtn','cancelDeletePaymentBtn'].forEach(id =>
      document.getElementById(id).addEventListener('click', () =>
        document.getElementById('deletePaymentModal').classList.remove('active'))
    );
    document.getElementById('confirmDeletePaymentBtn').addEventListener('click', () => this._confirmDelete());
  },

  _populateLotteryDropdown() {
    const sel = document.getElementById('mPayLottery');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">— Select Lottery —</option>' +
      this._lotteries.map(l => `<option value="${App.Utils.escHtml(l.lotteryName)}">${App.Utils.escHtml(l.lotteryName)}</option>`).join('');
    if (current) sel.value = current;
  },

  _renderTable() {
    const tbody = document.getElementById('paymentTableBody');
    if (!tbody) return;

    if (!this._terms.length) {
      tbody.innerHTML = App.Utils.tableEmptyRow('No payment terms yet. Click "New Term" to add.', 5);
      return;
    }

    // Flatten: one row per condition
    const rows = [];
    this._terms.forEach(term => {
      const conds = Array.isArray(term.conditions) ? term.conditions : [];
      if (!conds.length) {
        rows.push(`
          <tr>
            <td><strong>${App.Utils.escHtml(term.lotteryCategoryName)}</strong></td>
            <td colspan="3" style="color:var(--clr-warm-500)"><em>No conditions defined</em></td>
            <td>
              <button class="btn btn-ghost btn-sm" data-edit="${App.Utils.escHtml(term._id)}"><i class="fas fa-edit"></i> Edit</button>
              <button class="btn btn-danger btn-sm" data-delete="${App.Utils.escHtml(term._id)}" data-lottery="${App.Utils.escHtml(term.lotteryCategoryName)}"><i class="fas fa-trash-alt"></i></button>
            </td>
          </tr>`);
      } else {
        conds.forEach((c, ci) => {
          rows.push(`
            <tr>
              ${ci === 0 ? `<td rowspan="${conds.length}"><strong>${App.Utils.escHtml(term.lotteryCategoryName)}</strong></td>` : ''}
              <td>${App.Utils.escHtml(c.gameCategory || '—')}</td>
              <td>${App.Utils.escHtml(String(c.position || '—'))}</td>
              <td><strong>${App.Utils.escHtml(String(c.condition || 0))}×</strong></td>
              ${ci === 0 ? `<td rowspan="${conds.length}">
                <button class="btn btn-ghost btn-sm" data-edit="${App.Utils.escHtml(term._id)}"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-danger btn-sm" data-delete="${App.Utils.escHtml(term._id)}" data-lottery="${App.Utils.escHtml(term.lotteryCategoryName)}"><i class="fas fa-trash-alt"></i></button>
              </td>` : ''}
            </tr>`);
        });
      }
    });

    tbody.innerHTML = rows.join('');

    tbody.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const term = this._terms.find(t => t._id === btn.dataset.edit);
        if (term) this._openEdit(term);
      });
    });
    tbody.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this._openDeleteModal(btn.dataset.delete, btn.dataset.lottery));
    });
  },

  _addConditionRow(gameCategory = '', position = '', condition = '') {
    const container = document.getElementById('payConditionsContainer');
    const row       = document.createElement('div');
    row.className   = 'modal-grid condition-row';
    row.style.cssText = 'gap:8px; margin-bottom:6px; grid-template-columns: 1fr 80px 80px 36px;';
    row.innerHTML = `
      <select class="cond-game">
        <option value="">— Game —</option>
        ${this._gameCats.map(g => `<option value="${App.Utils.escHtml(g.gameName)}" ${g.gameName === gameCategory ? 'selected' : ''}>${App.Utils.escHtml(g.gameName)}</option>`).join('')}
      </select>
      <input type="number" class="cond-pos" min="1" max="20" placeholder="Pos" value="${App.Utils.escHtml(String(position))}">
      <input type="number" class="cond-val" min="0" step="1" placeholder="×" value="${App.Utils.escHtml(String(condition))}">
      <button class="btn btn-danger btn-sm remove-cond-btn" style="padding:6px 10px;" title="Remove">
        <i class="fas fa-times"></i>
      </button>
    `;
    row.querySelector('.remove-cond-btn').addEventListener('click', () => row.remove());
    container.appendChild(row);
  },

  _collectConditions() {
    const rows = document.querySelectorAll('#payConditionsContainer .condition-row');
    const conditions = [];
    rows.forEach(row => {
      const gameCategory = row.querySelector('.cond-game').value;
      const position     = parseInt(row.querySelector('.cond-pos').value, 10);
      const condition    = parseFloat(row.querySelector('.cond-val').value);
      if (gameCategory && !isNaN(position) && !isNaN(condition)) {
        conditions.push({ gameCategory, position, condition });
      }
    });
    return conditions;
  },

  _openCreate() {
    this._editingId      = null;
    this._editingLottery = '';
    document.getElementById('paymentModalTitle').innerHTML = '<i class="fas fa-dollar-sign"></i> New Payment Term';
    document.getElementById('mPayLottery').disabled = false;
    document.getElementById('mPayLottery').value    = '';
    document.getElementById('payConditionsContainer').innerHTML = '';
    this._addConditionRow(); // start with one empty row
    document.getElementById('paymentModal').classList.add('active');
  },

  _openEdit(term) {
    this._editingId      = term._id;
    this._editingLottery = term.lotteryCategoryName;
    document.getElementById('paymentModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Payment Term';
    document.getElementById('mPayLottery').disabled = true;
    document.getElementById('mPayLottery').value    = term.lotteryCategoryName;
    document.getElementById('payConditionsContainer').innerHTML = '';
    const conds = Array.isArray(term.conditions) ? term.conditions : [];
    if (conds.length) {
      conds.forEach(c => this._addConditionRow(c.gameCategory, c.position, c.condition));
    } else {
      this._addConditionRow();
    }
    document.getElementById('paymentModal').classList.add('active');
  },

  _openDeleteModal(id, lottery) {
    this._deletingId = id;
    document.getElementById('deletePaymentLotteryLabel').textContent = lottery;
    document.getElementById('deletePaymentModal').classList.add('active');
  },

  _closeModal() {
    document.getElementById('paymentModal').classList.remove('active');
    document.getElementById('mPayLottery').disabled = false;
  },

  _submit() {
    const isEdit  = !!this._editingId;
    const lottery = document.getElementById('mPayLottery').value;

    if (!isEdit && !lottery) {
      App.Utils.toast('Please select a lottery.', 'error');
      return;
    }

    const conditions = this._collectConditions();
    if (!conditions.length) {
      App.Utils.toast('Add at least one valid condition row.', 'error');
      return;
    }

    const confirmBtn = document.getElementById('confirmPaymentBtn');
    confirmBtn.disabled = true;

    const action = isEdit
      ? App.Api.updatePaymentTerm(this._editingId, { conditions })
      : App.Api.addPaymentTerm({ lotteryCategoryName: lottery, conditions });

    action.then(() => {
      this._closeModal();
      App.Utils.toast(`Payment term ${isEdit ? 'updated' : 'added'} successfully.`);
      return App.Api.getPaymentTerms();
    }).then(terms => {
      this._terms = Array.isArray(terms) ? terms : [];
      this._renderTable();
    }).catch(err => {
      App.Utils.toast(err.message || 'Operation failed.', 'error');
    }).finally(() => { confirmBtn.disabled = false; });
  },

  _confirmDelete() {
    const confirmBtn = document.getElementById('confirmDeletePaymentBtn');
    confirmBtn.disabled = true;

    App.Api.deletePaymentTerm(this._deletingId).then(() => {
      document.getElementById('deletePaymentModal').classList.remove('active');
      App.Utils.toast('Payment term deleted.');
      return App.Api.getPaymentTerms();
    }).then(terms => {
      this._terms = Array.isArray(terms) ? terms : [];
      this._renderTable();
    }).catch(err => {
      App.Utils.toast(err.message || 'Delete failed.', 'error');
    }).finally(() => { confirmBtn.disabled = false; });
  },
};


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
