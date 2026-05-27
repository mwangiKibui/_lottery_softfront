/* =====================================================================
   PRINCE LOTO — Sale Limits Page  (Sub-Admin only)
   Real API: GET/POST/PATCH/DELETE /api/subadmin/*limitbut*
   Limit doc: { _id, lotteryCategoryName, limits:[{ gameCategory, gameNumber, limitsButs }], seller?, superVisor? }
   getLimits(context, entity, lottery)  ← note new argument order
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Limit = {
  _limits:     [],
  _sellers:    [],
  _supervisors:[],
  _gameCats:   [],
  _lotteries:  [],
  _scope:      'all',   // 'all' | 'seller' | 'supervisor'
  _deletingId: null,
  _deletingLabel: '',

  render() {
    return `
      <div class="page-card">
        <div class="page-card-header">
          <h2><i class="fas fa-sliders-h"></i> Sale Limits</h2>
          <button class="btn btn-gradient btn-sm" id="openLimitModalBtn">
            <i class="fas fa-plus-circle"></i> Add Limit
          </button>
        </div>
        <hr class="divider">

        <!-- Scope filters -->
        <div class="filter-card" style="margin-bottom:16px;">
          <div class="filter-grid">
            <div class="filter-field">
              <label>Scope</label>
              <select id="limitScopeSelect">
                <option value="all">All (Sub-Admin)</option>
                <option value="seller">By Seller</option>
                <option value="supervisor">By Supervisor</option>
              </select>
            </div>
            <div class="filter-field" id="limitEntityWrap" style="display:none">
              <label id="limitEntityLabel">Entity</label>
              <select id="limitEntitySelect">
                <option value="">— Select —</option>
              </select>
            </div>
            <div class="filter-field">
              <label>Lottery</label>
              <select id="limitLotteryFilter">
                <option value="">All Lotteries</option>
              </select>
            </div>
            <div style="display:flex; align-items:flex-end;">
              <button class="btn btn-ghost btn-sm" id="loadLimitsBtn">
                <i class="fas fa-search"></i> Load
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
                <th>Number</th>
                <th style="text-align:right">Limit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="limitTableBody">
              <tr><td colspan="5" class="table-empty">Select scope and click Load.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Limit Modal -->
      <div id="limitModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3><i class="fas fa-sliders-h"></i> Add Limit</h3>
            <button class="modal-close" id="closeLimitModalBtn"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-grid">
            <div class="form-group">
              <label>Lottery <span class="required">*</span></label>
              <select id="mLimitLottery">
                <option value="">— Select Lottery —</option>
              </select>
            </div>
            <div class="form-group">
              <label>Game Category <span class="required">*</span></label>
              <select id="mLimitGameCat">
                <option value="">— Select Game —</option>
              </select>
            </div>
            <div class="form-group">
              <label>Game Number <span class="required">*</span></label>
              <input type="text" id="mLimitNumber" placeholder="e.g. 15">
            </div>
            <div class="form-group">
              <label>Limit Amount <span class="required">*</span></label>
              <input type="number" id="mLimitAmount" min="0" placeholder="e.g. 5000">
            </div>
            <div class="form-group" id="mLimitScopeWrap">
              <label>Apply To</label>
              <select id="mLimitScope">
                <option value="all">Sub-Admin (Global)</option>
                <option value="seller">Seller</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
            <div class="form-group" id="mLimitEntityWrap" style="display:none">
              <label id="mLimitEntityLabel">Select Entity</label>
              <select id="mLimitEntity">
                <option value="">— Select —</option>
              </select>
            </div>
          </div>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelLimitModalBtn">Cancel</button>
            <button class="btn btn-primary" id="confirmLimitBtn"><i class="fas fa-save"></i> Save</button>
          </div>
        </div>
      </div>

      <!-- Delete confirmation -->
      <div id="deleteLimitModal" class="modal-overlay">
        <div class="modal-container modal-sm">
          <div class="modal-header">
            <h3>Confirm Delete</h3>
            <button class="modal-close" id="closeDeleteLimitBtn"><i class="fas fa-times"></i></button>
          </div>
          <p style="margin:16px 0 24px;">Delete limit for <strong id="deleteLimitLabel"></strong>?</p>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelDeleteLimitBtn">Cancel</button>
            <button class="btn btn-danger" id="confirmDeleteLimitBtn"><i class="fas fa-trash-alt"></i> Delete</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this._scope = 'all';

    // Load reference data
    Promise.all([
      App.Api.getSellers().catch(() => ({ users: [] })),
      App.Api.getSupervisors().catch(() => []),
      App.Api.getGameCategories().catch(() => []),
      App.Api.getLotteryCategories().catch(() => []),
    ]).then(([sellerResp, supervisors, gameCats, lotteries]) => {
      this._sellers     = Array.isArray(sellerResp.users) ? sellerResp.users : [];
      this._supervisors = Array.isArray(supervisors) ? supervisors : [];
      this._gameCats    = Array.isArray(gameCats)    ? gameCats    : [];
      this._lotteries   = Array.isArray(lotteries)   ? lotteries   : [];

      this._populateDropdowns();
    });

    // Scope select (filter)
    document.getElementById('limitScopeSelect').addEventListener('change', e => {
      this._scope = e.target.value;
      const entityWrap  = document.getElementById('limitEntityWrap');
      const entitySel   = document.getElementById('limitEntitySelect');
      const entityLabel = document.getElementById('limitEntityLabel');

      if (this._scope === 'seller') {
        entityLabel.textContent = 'Seller';
        entitySel.innerHTML = '<option value="">All Sellers</option>' +
          this._sellers.map(s => `<option value="${App.Utils.escHtml(s._id)}">${App.Utils.escHtml(s.userName)}</option>`).join('');
        entityWrap.style.display = '';
      } else if (this._scope === 'supervisor') {
        entityLabel.textContent = 'Supervisor';
        entitySel.innerHTML = '<option value="">All Supervisors</option>' +
          this._supervisors.map(s => `<option value="${App.Utils.escHtml(s._id)}">${App.Utils.escHtml(s.userName)}</option>`).join('');
        entityWrap.style.display = '';
      } else {
        entityWrap.style.display = 'none';
        entitySel.innerHTML = '';
      }
    });

    document.getElementById('loadLimitsBtn').addEventListener('click', () => this._load());

    // Modal scope selector (inside add modal)
    document.getElementById('mLimitScope').addEventListener('change', e => {
      const val      = e.target.value;
      const eWrap    = document.getElementById('mLimitEntityWrap');
      const eLabel   = document.getElementById('mLimitEntityLabel');
      const eSel     = document.getElementById('mLimitEntity');
      if (val === 'seller') {
        eLabel.textContent = 'Seller';
        eSel.innerHTML = '<option value="">— Select Seller —</option>' +
          this._sellers.map(s => `<option value="${App.Utils.escHtml(s._id)}">${App.Utils.escHtml(s.userName)}</option>`).join('');
        eWrap.style.display = '';
      } else if (val === 'supervisor') {
        eLabel.textContent = 'Supervisor';
        eSel.innerHTML = '<option value="">— Select Supervisor —</option>' +
          this._supervisors.map(s => `<option value="${App.Utils.escHtml(s._id)}">${App.Utils.escHtml(s.userName)}</option>`).join('');
        eWrap.style.display = '';
      } else {
        eWrap.style.display = 'none';
      }
    });

    // Modal controls
    document.getElementById('openLimitModalBtn').addEventListener('click', () => this._openModal());
    ['closeLimitModalBtn','cancelLimitModalBtn'].forEach(id =>
      document.getElementById(id).addEventListener('click', () =>
        document.getElementById('limitModal').classList.remove('active'))
    );
    document.getElementById('limitModal').addEventListener('click', e => {
      if (e.target === e.currentTarget) document.getElementById('limitModal').classList.remove('active');
    });
    document.getElementById('confirmLimitBtn').addEventListener('click', () => this._submit());

    ['closeDeleteLimitBtn','cancelDeleteLimitBtn'].forEach(id =>
      document.getElementById(id).addEventListener('click', () =>
        document.getElementById('deleteLimitModal').classList.remove('active'))
    );
    document.getElementById('confirmDeleteLimitBtn').addEventListener('click', () => this._confirmDelete());
  },

  _populateDropdowns() {
    // Lottery filter
    const lotFilter = document.getElementById('limitLotteryFilter');
    if (lotFilter) {
      lotFilter.innerHTML = '<option value="">All Lotteries</option>' +
        this._lotteries.map(l => `<option value="${App.Utils.escHtml(l.lotteryName)}">${App.Utils.escHtml(l.lotteryName)}</option>`).join('');
    }
    // Modal lottery
    const mLotSel = document.getElementById('mLimitLottery');
    if (mLotSel) {
      mLotSel.innerHTML = '<option value="">— Select Lottery —</option>' +
        this._lotteries.map(l => `<option value="${App.Utils.escHtml(l.lotteryName)}">${App.Utils.escHtml(l.lotteryName)}</option>`).join('');
    }
    // Modal game category
    const mGamSel = document.getElementById('mLimitGameCat');
    if (mGamSel) {
      mGamSel.innerHTML = '<option value="">— Select Game —</option>' +
        this._gameCats.map(g => `<option value="${App.Utils.escHtml(g.gameName)}">${App.Utils.escHtml(g.gameName)}</option>`).join('');
    }
  },

  _load() {
    const scope  = this._scope;
    const entity = document.getElementById('limitEntitySelect')?.value || '';
    const lottery = document.getElementById('limitLotteryFilter')?.value || '';

    const context = scope === 'seller' ? 'seller' : (scope === 'supervisor' ? 'supervisor' : 'all');
    const entityVal = entity || '';

    const tbody = document.getElementById('limitTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(5);

    App.Api.getLimits(context, entityVal, lottery).then(limits => {
      this._limits = Array.isArray(limits) ? limits : [];

      if (!this._limits.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No limits found.', 5);
        return;
      }

      // Flatten: one row per limit entry in the limits array
      const rows = [];
      this._limits.forEach(doc => {
        const entries = Array.isArray(doc.limits) ? doc.limits : [];
        if (!entries.length) return;
        entries.forEach((e, i) => {
          rows.push(`
            <tr>
              ${i === 0 ? `<td rowspan="${entries.length}"><strong>${App.Utils.escHtml(doc.lotteryCategoryName)}</strong></td>` : ''}
              <td>${App.Utils.escHtml(e.gameCategory || '—')}</td>
              <td>${App.Utils.escHtml(e.gameNumber || '—')}</td>
              <td style="text-align:right"><strong>${App.Utils.formatMoney(e.limitsButs || 0)}</strong></td>
              ${i === 0 ? `<td rowspan="${entries.length}">
                <button class="btn btn-danger btn-sm" data-docid="${App.Utils.escHtml(doc._id)}" data-label="${App.Utils.escHtml(doc.lotteryCategoryName)}">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>` : ''}
            </tr>`);
        });
      });

      tbody.innerHTML = rows.join('');

      tbody.querySelectorAll('[data-docid]').forEach(btn => {
        btn.addEventListener('click', () => this._openDeleteModal(btn.dataset.docid, btn.dataset.label));
      });
    }).catch(err => {
      tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load limits.', 5);
      App.Utils.toast(err.message || 'Error loading limits.', 'error');
    });
  },

  _openModal() {
    document.getElementById('mLimitLottery').value  = '';
    document.getElementById('mLimitGameCat').value  = '';
    document.getElementById('mLimitNumber').value   = '';
    document.getElementById('mLimitAmount').value   = '';
    document.getElementById('mLimitScope').value    = 'all';
    document.getElementById('mLimitEntityWrap').style.display = 'none';
    document.getElementById('limitModal').classList.add('active');
  },

  _openDeleteModal(id, label) {
    this._deletingId    = id;
    this._deletingLabel = label;
    document.getElementById('deleteLimitLabel').textContent = label;
    document.getElementById('deleteLimitModal').classList.add('active');
  },

  _submit() {
    const lottery  = document.getElementById('mLimitLottery').value;
    const gameCat  = document.getElementById('mLimitGameCat').value;
    const number   = document.getElementById('mLimitNumber').value.trim();
    const amount   = parseFloat(document.getElementById('mLimitAmount').value);
    const scope    = document.getElementById('mLimitScope').value;
    const entity   = document.getElementById('mLimitEntity')?.value || '';

    if (!lottery || !gameCat || !number || isNaN(amount)) {
      App.Utils.toast('All required fields must be filled.', 'error');
      return;
    }
    if ((scope === 'seller' || scope === 'supervisor') && !entity) {
      App.Utils.toast(`Please select a ${scope}.`, 'error');
      return;
    }

    const payload = {
      lotteryCategoryName: lottery,
      limits: [{ gameCategory: gameCat, gameNumber: number, limitsButs: amount }],
    };
    if (scope === 'seller')     payload.seller     = entity;
    if (scope === 'supervisor') payload.superVisor = entity;

    const confirmBtn = document.getElementById('confirmLimitBtn');
    confirmBtn.disabled = true;

    App.Api.addLimit(payload).then(() => {
      document.getElementById('limitModal').classList.remove('active');
      App.Utils.toast('Limit added successfully.');
      this._load();
    }).catch(err => {
      App.Utils.toast(err.message || 'Failed to add limit.', 'error');
    }).finally(() => { confirmBtn.disabled = false; });
  },

  _confirmDelete() {
    const confirmBtn = document.getElementById('confirmDeleteLimitBtn');
    confirmBtn.disabled = true;

    App.Api.deleteLimit(this._deletingId).then(() => {
      document.getElementById('deleteLimitModal').classList.remove('active');
      App.Utils.toast(`Limit for "${this._deletingLabel}" deleted.`);
      this._load();
    }).catch(err => {
      App.Utils.toast(err.message || 'Delete failed.', 'error');
    }).finally(() => { confirmBtn.disabled = false; });
  },
};


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
