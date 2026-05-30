/* =====================================================================
   PRINCE LOTO — Percentage Limits Page  (Sub-Admin only)
   Scope: All (subAdmin-level) | Seller | Supervisor
   API:
     GET    /subadmin/getPercentageLimitbButAll
     GET    /subadmin/getPercentageLimitButSeller?seller=&lotteryCategoryName=
     GET    /subadmin/getPercentageLimitButSuperVisor?superVisor=&lotteryCategoryName=
     POST   /subadmin/addPercentageLimit
     PATCH  /subadmin/updatePercentageLimit/:id
     DELETE /subadmin/deletePercentageLimit/:id
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.PercentageLimit = {
  _limits:      [],
  _gameCats:    [],
  _lotteries:   [],
  _sellers:     [],
  _supervisors: [],
  _scope:       'all',    // 'all' | 'seller' | 'supervisor'
  _scopeEntity: '',       // id of selected seller/supervisor
  _scopeLottery:'',       // lottery filter for seller/supervisor scope
  _editingId:   null,
  _deletingId:  null,

  render() {
    return `
      <div class="page-card">
        <div class="page-card-header">
          <h2><i class="fas fa-percent"></i> Percentage Limits</h2>
          <button class="btn btn-gradient btn-sm" id="openPlModalBtn">
            <i class="fas fa-plus-circle"></i> New Limit
          </button>
        </div>
        <hr class="divider">

        <!-- Scope filter -->
        <div class="filter-card" style="margin-bottom:16px;">
          <div class="filter-title"><i class="fas fa-filter"></i> View Limits For</div>
          <div class="filter-grid" style="align-items:flex-end;">
            <div class="filter-field">
              <label>Scope</label>
              <select id="plScopeSelect">
                <option value="all">All (SubAdmin-level)</option>
                <option value="seller">Specific Seller</option>
                <option value="supervisor">Specific Supervisor</option>
              </select>
            </div>
            <div class="filter-field" id="plEntityWrap" style="display:none;">
              <label id="plEntityLabel">Entity</label>
              <select id="plEntitySelect">
                <option value="">— All —</option>
              </select>
            </div>
            <div class="filter-field" id="plLotteryWrap" style="display:none;">
              <label>Lottery (optional)</label>
              <select id="plLotterySelect">
                <option value="">All Lotteries</option>
              </select>
            </div>
            <div style="display:flex; align-items:flex-end;">
              <button class="btn btn-gradient btn-sm" id="plLoadBtn">
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
                <th style="text-align:right">Limit %</th>
                <th id="plScopeHeader" style="display:none;">Applies To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="plTableBody">
              ${App.Utils.tableLoadingRow(5)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <div id="plModal" class="modal-overlay">
        <div class="modal-container" style="max-width:580px;">
          <div class="modal-header">
            <h3 id="plModalTitle"><i class="fas fa-percent"></i> New Percentage Limit</h3>
            <button class="modal-close" id="closePlModalBtn"><i class="fas fa-times"></i></button>
          </div>

          <div class="modal-grid" style="margin-bottom:12px; grid-template-columns:1fr 1fr;">
            <div class="form-group">
              <label>Lottery <span class="required">*</span></label>
              <select id="mPlLottery">
                <option value="">— Select Lottery —</option>
              </select>
            </div>
            <div class="form-group">
              <label>Scope</label>
              <select id="mPlScope">
                <option value="all">SubAdmin-level (all)</option>
                <option value="seller">Specific Seller</option>
                <option value="supervisor">Specific Supervisor</option>
              </select>
            </div>
          </div>

          <div class="form-group" id="mPlEntityWrap" style="display:none; margin-bottom:12px;">
            <label id="mPlEntityLabel">Seller / Supervisor</label>
            <select id="mPlEntitySelect">
              <option value="">— Select —</option>
            </select>
          </div>

          <div style="margin-bottom:8px; font-weight:600; font-size:0.9rem;">
            Limits <span style="font-weight:400; font-size:0.82rem; color:var(--clr-warm-500)">(game category → max %)</span>
          </div>
          <div id="plLimitsContainer"></div>
          <button class="btn btn-ghost btn-sm" id="addPlRowBtn" style="margin-top:8px;">
            <i class="fas fa-plus"></i> Add Row
          </button>

          <div class="modal-buttons" style="margin-top:20px;">
            <button class="btn btn-ghost" id="cancelPlModalBtn">Cancel</button>
            <button class="btn btn-primary" id="confirmPlBtn">
              <i class="fas fa-save"></i> Save
            </button>
          </div>
        </div>
      </div>

      <!-- Delete confirmation -->
      <div id="deletePlModal" class="modal-overlay">
        <div class="modal-container modal-sm">
          <div class="modal-header">
            <h3>Confirm Delete</h3>
            <button class="modal-close" id="closeDeletePlBtn"><i class="fas fa-times"></i></button>
          </div>
          <p style="margin:16px 0 24px;">Delete this percentage limit?</p>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelDeletePlBtn">Cancel</button>
            <button class="btn btn-danger" id="confirmDeletePlBtn"><i class="fas fa-trash-alt"></i> Delete</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this._editingId   = null;
    this._deletingId  = null;
    this._scope       = 'all';
    this._scopeEntity = '';
    this._scopeLottery= '';

    // Load reference data + initial limits
    Promise.all([
      App.Api.getPercentageLimits('all').catch(() => []),
      App.Api.getGameCategories().catch(() => []),
      App.Api.getLotteryCategories().catch(() => []),
      App.Api.getSellers().catch(() => ({ users: [] })),
      App.Api.getSupervisors().catch(() => []),
    ]).then(([limits, gameCats, lotteries, sellerResp, supervisors]) => {
      this._limits      = Array.isArray(limits)            ? limits            : [];
      this._gameCats    = Array.isArray(gameCats)          ? gameCats          : [];
      this._lotteries   = Array.isArray(lotteries)         ? lotteries         : [];
      this._sellers     = Array.isArray(sellerResp.users)  ? sellerResp.users  : [];
      this._supervisors = Array.isArray(supervisors)       ? supervisors       : [];
      this._renderTable();
      this._populateLotteryDropdowns();
    });

    // Scope filter
    document.getElementById('plScopeSelect').addEventListener('change', e => {
      const scope = e.target.value;
      this._scope = scope;
      this._scopeEntity = '';
      const entityWrap  = document.getElementById('plEntityWrap');
      const lotteryWrap = document.getElementById('plLotteryWrap');
      const label       = document.getElementById('plEntityLabel');
      const sel         = document.getElementById('plEntitySelect');
      if (scope === 'seller' || scope === 'supervisor') {
        entityWrap.style.display  = '';
        lotteryWrap.style.display = '';
        label.textContent = scope === 'seller' ? 'Seller' : 'Supervisor';
        const list = scope === 'seller' ? this._sellers : this._supervisors;
        sel.innerHTML = '<option value="">— All —</option>' +
          list.map(s => `<option value="${App.Utils.escHtml(s._id)}">${App.Utils.escHtml(s.userName)}</option>`).join('');
        document.getElementById('plScopeHeader').style.display = '';
      } else {
        entityWrap.style.display  = 'none';
        lotteryWrap.style.display = 'none';
        document.getElementById('plScopeHeader').style.display = 'none';
      }
    });

    document.getElementById('plEntitySelect')?.addEventListener('change', e => {
      this._scopeEntity = e.target.value;
    });
    document.getElementById('plLotterySelect')?.addEventListener('change', e => {
      this._scopeLottery = e.target.value;
    });

    document.getElementById('plLoadBtn').addEventListener('click', () => this._loadLimits());

    // Modal scope change
    document.getElementById('mPlScope').addEventListener('change', e => {
      this._refreshModalEntityDropdown(e.target.value);
    });

    // Modal controls
    document.getElementById('openPlModalBtn').addEventListener('click', () => this._openCreate());
    ['closePlModalBtn','cancelPlModalBtn'].forEach(id =>
      document.getElementById(id).addEventListener('click', () => this._closeModal())
    );
    document.getElementById('plModal').addEventListener('click', e => {
      if (e.target === e.currentTarget) this._closeModal();
    });
    document.getElementById('confirmPlBtn').addEventListener('click', () => this._submit());
    document.getElementById('addPlRowBtn').addEventListener('click', () => this._addLimitRow());

    // Delete modal
    ['closeDeletePlBtn','cancelDeletePlBtn'].forEach(id =>
      document.getElementById(id).addEventListener('click', () =>
        document.getElementById('deletePlModal').classList.remove('active'))
    );
    document.getElementById('confirmDeletePlBtn').addEventListener('click', () => this._confirmDelete());
  },

  _loadLimits() {
    const tbody = document.getElementById('plTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(5);
    App.Api.getPercentageLimits(this._scope, this._scopeEntity, this._scopeLottery).then(limits => {
      this._limits = Array.isArray(limits) ? limits : [];
      this._renderTable();
    }).catch(err => {
      tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load limits.', 5);
      App.Utils.toast(err.message || 'Error loading limits.', 'error');
    });
  },

  _populateLotteryDropdowns() {
    // Modal lottery dropdown
    const mSel = document.getElementById('mPlLottery');
    if (mSel) {
      const cur = mSel.value;
      mSel.innerHTML = '<option value="">— Select Lottery —</option>' +
        this._lotteries.map(l =>
          `<option value="${App.Utils.escHtml(l.lotteryName)}">${App.Utils.escHtml(l.lotteryName)}</option>`
        ).join('');
      if (cur) mSel.value = cur;
    }
    // Filter lottery dropdown
    const fSel = document.getElementById('plLotterySelect');
    if (fSel) {
      fSel.innerHTML = '<option value="">All Lotteries</option>' +
        this._lotteries.map(l =>
          `<option value="${App.Utils.escHtml(l.lotteryName)}">${App.Utils.escHtml(l.lotteryName)}</option>`
        ).join('');
    }
  },

  _refreshModalEntityDropdown(scope, selected = '') {
    const wrap  = document.getElementById('mPlEntityWrap');
    const label = document.getElementById('mPlEntityLabel');
    const sel   = document.getElementById('mPlEntitySelect');
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
    const tbody     = document.getElementById('plTableBody');
    const showScope = this._scope !== 'all';
    const colCount  = showScope ? 5 : 4;
    if (!tbody) return;

    const hdr = document.getElementById('plScopeHeader');
    if (hdr) hdr.style.display = showScope ? '' : 'none';

    if (!this._limits.length) {
      tbody.innerHTML = App.Utils.tableEmptyRow('No percentage limits found. Click "New Limit" to add.', colCount);
      return;
    }

    const rows = [];
    this._limits.forEach(lim => {
      const limitRows  = Array.isArray(lim.limits) ? lim.limits : [];
      const scopeLabel = lim.seller
        ? (lim.seller.userName || 'Seller')
        : lim.superVisor
          ? (lim.superVisor.userName || 'Supervisor')
          : 'SubAdmin-level';

      if (!limitRows.length) {
        rows.push(`
          <tr>
            <td><strong>${App.Utils.escHtml(lim.lotteryCategoryName)}</strong></td>
            <td colspan="2" style="color:var(--clr-warm-500)"><em>No rows</em></td>
            ${showScope ? `<td><span style="font-size:0.82rem;color:var(--clr-warm-500)">${App.Utils.escHtml(scopeLabel)}</span></td>` : ''}
            <td>
              <button class="btn btn-ghost btn-sm" data-edit="${App.Utils.escHtml(lim._id)}"><i class="fas fa-edit"></i> Edit</button>
              <button class="btn btn-danger btn-sm" data-delete="${App.Utils.escHtml(lim._id)}"><i class="fas fa-trash-alt"></i></button>
            </td>
          </tr>`);
      } else {
        limitRows.forEach((r, ri) => {
          rows.push(`
            <tr>
              ${ri === 0 ? `<td rowspan="${limitRows.length}"><strong>${App.Utils.escHtml(lim.lotteryCategoryName)}</strong></td>` : ''}
              <td>${App.Utils.escHtml(r.gameCategory || '—')}</td>
              <td style="text-align:right"><strong>${App.Utils.escHtml(String(r.limitPercent || 0))}%</strong></td>
              ${ri === 0 && showScope ? `<td rowspan="${limitRows.length}"><span style="font-size:0.82rem;color:var(--clr-warm-500)">${App.Utils.escHtml(scopeLabel)}</span></td>` : ''}
              ${ri === 0 ? `<td rowspan="${limitRows.length}">
                <button class="btn btn-ghost btn-sm" data-edit="${App.Utils.escHtml(lim._id)}"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-danger btn-sm" data-delete="${App.Utils.escHtml(lim._id)}"><i class="fas fa-trash-alt"></i></button>
              </td>` : ''}
            </tr>`);
        });
      }
    });

    tbody.innerHTML = rows.join('');

    tbody.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lim = this._limits.find(l => l._id === btn.dataset.edit);
        if (lim) this._openEdit(lim);
      });
    });
    tbody.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._deletingId = btn.dataset.delete;
        document.getElementById('deletePlModal').classList.add('active');
      });
    });
  },

  _addLimitRow(gameCategory = '', limitPercent = '') {
    const container = document.getElementById('plLimitsContainer');
    const row       = document.createElement('div');
    row.className   = 'modal-grid limit-row';
    row.style.cssText = 'gap:8px; margin-bottom:6px; grid-template-columns:1fr 100px 36px;';
    row.innerHTML = `
      <select class="pl-game">
        <option value="">— Game Category —</option>
        ${this._gameCats.map(g =>
          `<option value="${App.Utils.escHtml(g.gameName)}" ${g.gameName === gameCategory ? 'selected' : ''}>${App.Utils.escHtml(g.gameName)}</option>`
        ).join('')}
      </select>
      <input type="number" class="pl-pct" min="0" max="100" step="0.01" placeholder="%" value="${App.Utils.escHtml(String(limitPercent))}">
      <button class="btn btn-danger btn-sm remove-pl-row" style="padding:6px 10px;" title="Remove">
        <i class="fas fa-times"></i>
      </button>
    `;
    row.querySelector('.remove-pl-row').addEventListener('click', () => row.remove());
    container.appendChild(row);
  },

  _collectLimits() {
    const rows = document.querySelectorAll('#plLimitsContainer .limit-row');
    const limits = [];
    rows.forEach(row => {
      const gameCategory = row.querySelector('.pl-game').value;
      const limitPercent = parseFloat(row.querySelector('.pl-pct').value);
      if (gameCategory && !isNaN(limitPercent)) {
        limits.push({ gameCategory, limitPercent });
      }
    });
    return limits;
  },

  _openCreate() {
    this._editingId = null;
    document.getElementById('plModalTitle').innerHTML = '<i class="fas fa-percent"></i> New Percentage Limit';
    document.getElementById('mPlLottery').disabled = false;
    document.getElementById('mPlLottery').value    = '';
    document.getElementById('mPlScope').disabled   = false;
    document.getElementById('mPlScope').value      = 'all';
    this._refreshModalEntityDropdown('all');
    document.getElementById('plLimitsContainer').innerHTML = '';
    this._addLimitRow();
    document.getElementById('plModal').classList.add('active');
  },

  _openEdit(lim) {
    this._editingId = lim._id;
    document.getElementById('plModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Percentage Limit';
    document.getElementById('mPlLottery').disabled = true;
    document.getElementById('mPlLottery').value    = lim.lotteryCategoryName;

    let scope    = 'all';
    let entityId = '';
    if (lim.seller) {
      scope    = 'seller';
      entityId = (typeof lim.seller === 'object') ? lim.seller._id : lim.seller;
    } else if (lim.superVisor) {
      scope    = 'supervisor';
      entityId = (typeof lim.superVisor === 'object') ? lim.superVisor._id : lim.superVisor;
    }

    document.getElementById('mPlScope').disabled = true;
    document.getElementById('mPlScope').value    = scope;
    this._refreshModalEntityDropdown(scope, entityId);
    const entSel = document.getElementById('mPlEntitySelect');
    if (entSel) entSel.disabled = true;

    document.getElementById('plLimitsContainer').innerHTML = '';
    const limitRows = Array.isArray(lim.limits) ? lim.limits : [];
    if (limitRows.length) {
      limitRows.forEach(r => this._addLimitRow(r.gameCategory, r.limitPercent));
    } else {
      this._addLimitRow();
    }
    document.getElementById('plModal').classList.add('active');
  },

  _closeModal() {
    document.getElementById('plModal').classList.remove('active');
    document.getElementById('mPlLottery').disabled = false;
    document.getElementById('mPlScope').disabled   = false;
    const entSel = document.getElementById('mPlEntitySelect');
    if (entSel) entSel.disabled = false;
  },

  _submit() {
    const isEdit   = !!this._editingId;
    const lottery  = document.getElementById('mPlLottery').value;

    if (!isEdit && !lottery) {
      App.Utils.toast('Please select a lottery.', 'error');
      return;
    }

    const limits = this._collectLimits();
    if (!limits.length) {
      App.Utils.toast('Add at least one valid limit row.', 'error');
      return;
    }

    const scope    = document.getElementById('mPlScope').value;
    const entityId = document.getElementById('mPlEntitySelect')?.value || '';

    const confirmBtn = document.getElementById('confirmPlBtn');
    confirmBtn.disabled = true;

    let payload;
    if (isEdit) {
      payload = { lotteryCategoryName: lottery || undefined, limits };
    } else {
      payload = { lotteryCategoryName: lottery, limits };
      if (scope === 'seller')     payload.seller     = entityId || undefined;
      if (scope === 'supervisor') payload.superVisor = entityId || undefined;
    }

    const action = isEdit
      ? App.Api.updatePercentageLimit(this._editingId, payload)
      : App.Api.addPercentageLimit(payload);

    action.then(() => {
      this._closeModal();
      App.Utils.toast(`Limit ${isEdit ? 'updated' : 'added'} successfully.`);
      return App.Api.getPercentageLimits(this._scope, this._scopeEntity, this._scopeLottery);
    }).then(limits => {
      this._limits = Array.isArray(limits) ? limits : [];
      this._renderTable();
    }).catch(err => {
      App.Utils.toast(err.message || 'Operation failed.', 'error');
    }).finally(() => { confirmBtn.disabled = false; });
  },

  _confirmDelete() {
    const confirmBtn = document.getElementById('confirmDeletePlBtn');
    confirmBtn.disabled = true;

    App.Api.deletePercentageLimit(this._deletingId).then(() => {
      document.getElementById('deletePlModal').classList.remove('active');
      App.Utils.toast('Limit deleted.');
      return App.Api.getPercentageLimits(this._scope, this._scopeEntity, this._scopeLottery);
    }).then(limits => {
      this._limits = Array.isArray(limits) ? limits : [];
      this._renderTable();
    }).catch(err => {
      App.Utils.toast(err.message || 'Delete failed.', 'error');
    }).finally(() => { confirmBtn.disabled = false; });
  },
};
