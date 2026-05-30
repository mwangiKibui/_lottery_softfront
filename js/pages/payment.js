/* =====================================================================
   PRINCE LOTO — Payment Terms Page  (Sub-Admin only)
   Scope: All (subAdmin-level) | Seller | Supervisor
   Versioning: edit archives old term, creates a new one
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Payment = {
  _terms:      [],
  _gameCats:   [],
  _lotteries:  [],
  _sellers:    [],
  _supervisors:[],
  _scope:      'all',   // 'all' | 'seller' | 'supervisor'
  _scopeEntity:'',      // selected seller/supervisor _id for filter
  _editingId:  null,
  _editingLottery: '',
  _deletingId: null,

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

        <!-- Scope filter -->
        <div class="filter-card" style="margin-bottom:16px;">
          <div class="filter-title"><i class="fas fa-filter"></i> View Terms For</div>
          <div class="filter-grid" style="align-items:flex-end;">
            <div class="filter-field">
              <label>Scope</label>
              <select id="ptScopeSelect">
                <option value="all">All (SubAdmin-level)</option>
                <option value="seller">Specific Seller</option>
                <option value="supervisor">Specific Supervisor</option>
              </select>
            </div>
            <div class="filter-field" id="ptEntityWrap" style="display:none;">
              <label id="ptEntityLabel">Entity</label>
              <select id="ptEntitySelect">
                <option value="">— Select —</option>
              </select>
            </div>
            <div style="display:flex; align-items:flex-end;">
              <button class="btn btn-gradient btn-sm" id="ptLoadBtn">
                <i class="fas fa-sync-alt"></i> Load
              </button>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Lottery</th>
                <th>Game Category</th>
                <th>Position</th>
                <th>Multiplier (×)</th>
                <th id="ptScopeHeader" style="display:none;">Applies To</th>
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
        <div class="modal-container" style="max-width:580px;">
          <div class="modal-header">
            <h3 id="paymentModalTitle"><i class="fas fa-dollar-sign"></i> New Payment Term</h3>
            <button class="modal-close" id="closePaymentModalBtn"><i class="fas fa-times"></i></button>
          </div>

          <div class="modal-grid" style="margin-bottom:12px; grid-template-columns:1fr 1fr;">
            <div class="form-group">
              <label>Lottery <span class="required">*</span></label>
              <select id="mPayLottery">
                <option value="">— Select Lottery —</option>
              </select>
            </div>
            <div class="form-group">
              <label>Scope</label>
              <select id="mPayScope">
                <option value="all">SubAdmin-level (all)</option>
                <option value="seller">Specific Seller</option>
                <option value="supervisor">Specific Supervisor</option>
              </select>
            </div>
          </div>

          <div class="form-group" id="mPayEntityWrap" style="display:none; margin-bottom:12px;">
            <label id="mPayEntityLabel">Seller / Supervisor</label>
            <select id="mPayEntitySelect">
              <option value="">— Select —</option>
            </select>
          </div>

          <div style="margin-bottom:8px; font-weight:600; font-size:0.9rem;">Conditions</div>
          <div id="payConditionsContainer"></div>
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
    this._editingId      = null;
    this._editingLottery = '';
    this._deletingId     = null;
    this._scope          = 'all';
    this._scopeEntity    = '';

    // Load all reference data + initial terms (subAdmin-level)
    Promise.all([
      App.Api.getPaymentTerms('all').catch(() => []),
      App.Api.getGameCategories().catch(() => []),
      App.Api.getLotteryCategories().catch(() => []),
      App.Api.getSellers().catch(() => ({ users: [] })),
      App.Api.getSupervisors().catch(() => []),
    ]).then(([terms, gameCats, lotteries, sellerResp, supervisors]) => {
      this._terms       = Array.isArray(terms)             ? terms             : [];
      this._gameCats    = Array.isArray(gameCats)          ? gameCats          : [];
      this._lotteries   = Array.isArray(lotteries)         ? lotteries         : [];
      this._sellers     = Array.isArray(sellerResp.users)  ? sellerResp.users  : [];
      this._supervisors = Array.isArray(supervisors)       ? supervisors       : [];
      this._renderTable();
      this._populateLotteryDropdown();
    });

    // Scope filter change
    document.getElementById('ptScopeSelect').addEventListener('change', e => {
      const scope = e.target.value;
      this._scope = scope;
      this._scopeEntity = '';
      const wrap  = document.getElementById('ptEntityWrap');
      const label = document.getElementById('ptEntityLabel');
      const sel   = document.getElementById('ptEntitySelect');

      if (scope === 'seller' || scope === 'supervisor') {
        wrap.style.display = '';
        label.textContent  = scope === 'seller' ? 'Seller' : 'Supervisor';
        const list = scope === 'seller' ? this._sellers : this._supervisors;
        sel.innerHTML = '<option value="">— All —</option>' +
          list.map(s => `<option value="${App.Utils.escHtml(s._id)}">${App.Utils.escHtml(s.userName)}</option>`).join('');
        document.getElementById('ptScopeHeader').style.display = '';
      } else {
        wrap.style.display = 'none';
        document.getElementById('ptScopeHeader').style.display = 'none';
      }
    });

    document.getElementById('ptEntitySelect')?.addEventListener('change', e => {
      this._scopeEntity = e.target.value;
    });

    document.getElementById('ptLoadBtn').addEventListener('click', () => this._loadTerms());

    // Modal scope change
    document.getElementById('mPayScope').addEventListener('change', e => {
      this._refreshModalEntityDropdown(e.target.value);
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

  _loadTerms() {
    const tbody = document.getElementById('paymentTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(6);
    App.Api.getPaymentTerms(this._scope, this._scopeEntity).then(terms => {
      this._terms = Array.isArray(terms) ? terms : [];
      this._renderTable();
    }).catch(err => {
      tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load terms.', 6);
      App.Utils.toast(err.message || 'Error loading payment terms.', 'error');
    });
  },

  _populateLotteryDropdown() {
    const sel = document.getElementById('mPayLottery');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">— Select Lottery —</option>' +
      this._lotteries.map(l =>
        `<option value="${App.Utils.escHtml(l.lotteryName)}">${App.Utils.escHtml(l.lotteryName)}</option>`
      ).join('');
    if (current) sel.value = current;
  },

  _refreshModalEntityDropdown(scope, selected = '') {
    const wrap  = document.getElementById('mPayEntityWrap');
    const label = document.getElementById('mPayEntityLabel');
    const sel   = document.getElementById('mPayEntitySelect');
    if (scope === 'seller' || scope === 'supervisor') {
      wrap.style.display = '';
      label.textContent  = scope === 'seller' ? 'Seller' : 'Supervisor';
      const list = scope === 'seller' ? this._sellers : this._supervisors;
      sel.innerHTML = '<option value="">— Select —</option>' +
        list.map(s => `<option value="${App.Utils.escHtml(s._id)}">${App.Utils.escHtml(s.userName)}</option>`).join('');
      if (selected) sel.value = selected;
    } else {
      wrap.style.display = 'none';
    }
  },

  _renderTable() {
    const tbody      = document.getElementById('paymentTableBody');
    const showScope  = this._scope !== 'all';
    const colCount   = showScope ? 6 : 5;
    if (!tbody) return;

    // Update header visibility
    const hdr = document.getElementById('ptScopeHeader');
    if (hdr) hdr.style.display = showScope ? '' : 'none';

    if (!this._terms.length) {
      tbody.innerHTML = App.Utils.tableEmptyRow('No payment terms found. Click "New Term" to add.', colCount);
      return;
    }

    const rows = [];
    this._terms.forEach(term => {
      const conds    = Array.isArray(term.conditions) ? term.conditions : [];
      const scopeLabel = term.seller
        ? (term.seller.userName || 'Seller')
        : term.superVisor
          ? (term.superVisor.userName || 'Supervisor')
          : 'SubAdmin-level';
      const scopeCell = showScope ? `<td><span style="font-size:0.82rem; color:var(--clr-warm-500)">${App.Utils.escHtml(scopeLabel)}</span></td>` : '';

      if (!conds.length) {
        rows.push(`
          <tr>
            <td><strong>${App.Utils.escHtml(term.lotteryCategoryName)}</strong></td>
            <td colspan="3" style="color:var(--clr-warm-500)"><em>No conditions</em></td>
            ${scopeCell}
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
              ${ci === 0 && showScope ? `<td rowspan="${conds.length}"><span style="font-size:0.82rem;color:var(--clr-warm-500)">${App.Utils.escHtml(scopeLabel)}</span></td>` : (ci === 0 && !showScope ? '' : '')}
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
    row.style.cssText = 'gap:8px; margin-bottom:6px; grid-template-columns:1fr 80px 80px 36px;';
    row.innerHTML = `
      <select class="cond-game">
        <option value="">— Game —</option>
        ${this._gameCats.map(g =>
          `<option value="${App.Utils.escHtml(g.gameName)}" ${g.gameName === gameCategory ? 'selected' : ''}>${App.Utils.escHtml(g.gameName)}</option>`
        ).join('')}
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
    document.getElementById('mPayScope').disabled   = false;
    document.getElementById('mPayScope').value      = 'all';
    this._refreshModalEntityDropdown('all');
    document.getElementById('payConditionsContainer').innerHTML = '';
    this._addConditionRow();
    document.getElementById('paymentModal').classList.add('active');
  },

  _openEdit(term) {
    this._editingId      = term._id;
    this._editingLottery = term.lotteryCategoryName;
    document.getElementById('paymentModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Payment Term';
    document.getElementById('mPayLottery').disabled = true;
    document.getElementById('mPayLottery').value    = term.lotteryCategoryName;

    // Determine scope from the term
    let scope    = 'all';
    let entityId = '';
    if (term.seller) {
      scope    = 'seller';
      entityId = (typeof term.seller === 'object') ? term.seller._id : term.seller;
    } else if (term.superVisor) {
      scope    = 'supervisor';
      entityId = (typeof term.superVisor === 'object') ? term.superVisor._id : term.superVisor;
    }

    // Scope select disabled on edit (scope is fixed)
    document.getElementById('mPayScope').disabled = true;
    document.getElementById('mPayScope').value    = scope;
    this._refreshModalEntityDropdown(scope, entityId);
    document.getElementById('mPayEntitySelect').disabled = true;

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
    document.getElementById('mPayLottery').disabled     = false;
    document.getElementById('mPayScope').disabled       = false;
    document.getElementById('mPayEntitySelect').disabled = false;
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

    // Scope + entity for new terms
    const scope    = document.getElementById('mPayScope').value;
    const entityId = document.getElementById('mPayEntitySelect')?.value || '';

    const confirmBtn = document.getElementById('confirmPaymentBtn');
    confirmBtn.disabled = true;

    let payload;
    if (isEdit) {
      payload = { conditions };
    } else {
      payload = { lotteryCategoryName: lottery, conditions };
      if (scope === 'seller')     payload.seller     = entityId || undefined;
      if (scope === 'supervisor') payload.superVisor = entityId || undefined;
    }

    const action = isEdit
      ? App.Api.updatePaymentTerm(this._editingId, payload)
      : App.Api.addPaymentTerm(payload);

    action.then(() => {
      this._closeModal();
      App.Utils.toast(`Payment term ${isEdit ? 'updated' : 'added'} successfully.`);
      return App.Api.getPaymentTerms(this._scope, this._scopeEntity);
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
      return App.Api.getPaymentTerms(this._scope, this._scopeEntity);
    }).then(terms => {
      this._terms = Array.isArray(terms) ? terms : [];
      this._renderTable();
    }).catch(err => {
      App.Utils.toast(err.message || 'Delete failed.', 'error');
    }).finally(() => { confirmBtn.disabled = false; });
  },
};
