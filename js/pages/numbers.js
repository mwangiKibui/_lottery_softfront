/* =====================================================================
   PRINCE LOTO — Draw / Winning Numbers Page
   Admin:    full CRUD — post winning numbers per lottery draw.
   Others:   read-only filtered view.
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Numbers = {
  _editingId:      null,
  _deletingId:     null,
  _lotteryOptions: '',
  _gameCategories: [],

  _isAdmin() {
    const user = App.Auth.getUser();
    return user && user.role === 'admin';
  },

  render() {
    return `
      <div class="page-card">
        <div class="page-card-header">
          <h2><i class="fas fa-dice-d6"></i> Winning Numbers</h2>
          ${this._isAdmin() ? `
          <button class="btn btn-gradient btn-sm" id="openWinNumModalBtn">
            <i class="fas fa-plus-circle"></i> Post Winning Numbers
          </button>` : ''}
        </div>
        <hr class="divider">

        <!-- Filters -->
        <div class="filter-card">
          <div class="filter-title"><i class="fas fa-filter"></i> Filters</div>
          <div class="filter-grid">
            <div class="filter-field">
              <label>Lottery</label>
              <select id="numLotteryFilter">
                <option value="">All Lotteries</option>
                <span id="numLotteryOptions"></span>
              </select>
            </div>
            <div class="filter-field">
              <label>From Date</label>
              <input type="date" id="numFromDate">
            </div>
            <div class="filter-field">
              <label>To Date</label>
              <input type="date" id="numToDate">
            </div>
            <div>
              <button class="btn btn-gradient btn-sm" id="searchNumBtn">
                <i class="fas fa-search"></i> Search
              </button>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Lottery</th>
                <th>Date</th>
                <th>Winning Numbers</th>
                ${this._isAdmin() ? '<th>Actions</th>' : ''}
              </tr>
            </thead>
            <tbody id="numTableBody">
              ${App.Utils.tableLoadingRow(this._isAdmin() ? 4 : 3)}
            </tbody>
          </table>
        </div>
      </div>

      ${this._isAdmin() ? this._renderModal() : ''}
      ${this._isAdmin() ? this._renderDeleteModal() : ''}
    `;
  },

  _renderModal() {
    return `
    <!-- Add / Edit Winning Numbers Modal -->
    <div id="winNumModal" class="modal-overlay">
      <div class="modal-container" style="max-width:560px">
        <div class="modal-header">
          <h3 id="winNumModalTitle"><i class="fas fa-trophy"></i> Post Winning Numbers</h3>
          <button class="modal-close" id="closeWinNumModalBtn" aria-label="Close"><i class="fas fa-times"></i></button>
        </div>
        <div style="padding:0 1.5rem">
          <div class="form-group">
            <label>Lottery <span class="required">*</span></label>
            <select id="wnLottery"></select>
          </div>
          <div class="form-group">
            <label>Date <span class="required">*</span></label>
            <input type="date" id="wnDate">
          </div>

          <div style="margin-bottom:.75rem">
            <label style="font-weight:600">Numbers <span class="required">*</span></label>
            <p style="font-size:.8rem;color:var(--text-muted);margin:.25rem 0 .5rem">Add one row per game category / position combination.</p>
          </div>
          <div id="wnNumberRows"></div>
          <button class="btn btn-ghost btn-sm" id="addWnRowBtn" style="margin-bottom:1rem">
            <i class="fas fa-plus"></i> Add Number Row
          </button>
        </div>
        <div class="modal-buttons">
          <button class="btn btn-ghost" id="cancelWinNumModalBtn">Cancel</button>
          <button class="btn btn-primary" id="confirmWinNumBtn"><i class="fas fa-save"></i> Save</button>
        </div>
      </div>
    </div>`;
  },

  _renderDeleteModal() {
    return `
    <div id="winNumDeleteModal" class="modal-overlay">
      <div class="modal-container" style="max-width:380px">
        <div class="modal-header">
          <h3><i class="fas fa-trash-alt"></i> Delete Winning Numbers</h3>
          <button class="modal-close" id="closeDelWinNumBtn" aria-label="Close"><i class="fas fa-times"></i></button>
        </div>
        <p style="padding:0 1.5rem 1rem">Delete winning numbers for <strong id="delWinNumLabel"></strong>? This cannot be undone.</p>
        <div class="modal-buttons">
          <button class="btn btn-ghost" id="cancelDelWinNumBtn">Cancel</button>
          <button class="btn btn-danger" id="confirmDelWinNumBtn"><i class="fas fa-trash-alt"></i> Delete</button>
        </div>
      </div>
    </div>`;
  },

  init() {
    this._editingId  = null;
    this._deletingId = null;
    const cols = this._isAdmin() ? 4 : 3;

    // Load lottery categories for filter select
    App.Api.getLotteryCategories().then(cats => {
      this._lotteries = cats || [];
      const sel = document.getElementById('numLotteryFilter');
      if (sel) {
        this._lotteries.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.lotteryName;
          opt.textContent = c.lotteryName;
          sel.appendChild(opt);
        });
      }
    }).catch(() => { this._lotteries = []; });

    // Load game categories (admin needs them for number rows)
    if (this._isAdmin()) {
      App.Api.getGameCategories().then(cats => {
        this._gameCategories = cats || [];
      }).catch(() => { this._gameCategories = []; });
    }

    document.getElementById('searchNumBtn').addEventListener('click', () => this._load());
    ['numLotteryFilter','numFromDate','numToDate'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => this._load());
    });

    if (this._isAdmin()) {
      document.getElementById('openWinNumModalBtn').addEventListener('click', () => this._openModal());
      document.getElementById('closeWinNumModalBtn').addEventListener('click', () => this._closeModal());
      document.getElementById('cancelWinNumModalBtn').addEventListener('click', () => this._closeModal());
      document.getElementById('winNumModal').addEventListener('click', e => { if (e.target === e.currentTarget) this._closeModal(); });
      document.getElementById('confirmWinNumBtn').addEventListener('click', () => this._submit());
      document.getElementById('addWnRowBtn').addEventListener('click', () => this._addNumberRow());

      document.getElementById('closeDelWinNumBtn').addEventListener('click', () => this._closeDeleteModal());
      document.getElementById('cancelDelWinNumBtn').addEventListener('click', () => this._closeDeleteModal());
      document.getElementById('winNumDeleteModal').addEventListener('click', e => { if (e.target === e.currentTarget) this._closeDeleteModal(); });
      document.getElementById('confirmDelWinNumBtn').addEventListener('click', () => this._doDelete());
    }

    this._load();
  },

  _load() {
    const lottery  = document.getElementById('numLotteryFilter')?.value  || '';
    const fromDate = document.getElementById('numFromDate')?.value        || '';
    const toDate   = document.getElementById('numToDate')?.value          || '';
    const cols     = this._isAdmin() ? 4 : 3;

    const tbody = document.getElementById('numTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(cols);

    App.Api.getWinningNumbers({ lottery, fromDate, toDate }).then(draws => {
      if (!draws || draws.length === 0) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No winning numbers found.', cols);
        return;
      }
      tbody.innerHTML = draws.map(d => {
        const numsSummary = Array.isArray(d.numbers)
          ? d.numbers.map(n =>
              `<span class="badge badge--neutral">${App.Utils.escHtml(n.gameCategory)} #${App.Utils.escHtml(String(n.position))}: <strong>${App.Utils.escHtml(n.number)}</strong></span>`
            ).join(' ')
          : '—';
        return `
          <tr>
            <td>${App.Utils.escHtml(d.lotteryCategoryName || d.lottery || '')}</td>
            <td>${App.Utils.formatDate(d.date)}</td>
            <td>${numsSummary}</td>
            ${this._isAdmin() ? `
            <td>
              <button class="btn btn-ghost btn-sm" data-edit="${App.Utils.escHtml(d._id)}"
                data-lottery="${App.Utils.escHtml(d.lotteryCategoryName || '')}"
                data-date="${App.Utils.escHtml((d.date || '').substring(0, 10))}"
                data-numbers='${App.Utils.escHtml(JSON.stringify(d.numbers || []))}'>
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-danger btn-sm" data-delete="${App.Utils.escHtml(d._id)}"
                data-label="${App.Utils.escHtml(d.lotteryCategoryName || '')} — ${App.Utils.formatDate(d.date)}">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>` : ''}
          </tr>
        `;
      }).join('');

      if (this._isAdmin()) {
        tbody.querySelectorAll('[data-edit]').forEach(btn => {
          btn.addEventListener('click', () => {
            let nums = [];
            try { nums = JSON.parse(btn.dataset.numbers); } catch {}
            this._openModal({
              _id:                 btn.dataset.edit,
              lotteryCategoryName: btn.dataset.lottery,
              date:                btn.dataset.date,
              numbers:             nums,
            });
          });
        });
        tbody.querySelectorAll('[data-delete]').forEach(btn => {
          btn.addEventListener('click', () => this._openDeleteModal(btn.dataset.delete, btn.dataset.label));
        });
      }
    }).catch(err => {
      tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load winning numbers.', this._isAdmin() ? 4 : 3);
      App.Utils.toast(err.message || 'Error loading winning numbers.', 'error');
    });
  },

  _openModal(win = null) {
    this._editingId = win ? win._id : null;
    document.getElementById('winNumModalTitle').innerHTML = win
      ? '<i class="fas fa-edit"></i> Edit Winning Numbers'
      : '<i class="fas fa-trophy"></i> Post Winning Numbers';

    // Populate lottery select
    const lotSel = document.getElementById('wnLottery');
    lotSel.innerHTML = '<option value="">Select lottery...</option>';
    (this._lotteries || []).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.lotteryName;
      opt.textContent = c.lotteryName;
      if (win && c.lotteryName === win.lotteryCategoryName) opt.selected = true;
      lotSel.appendChild(opt);
    });

    document.getElementById('wnDate').value = win ? win.date : new Date().toISOString().substring(0, 10);

    // Render number rows
    const rowsContainer = document.getElementById('wnNumberRows');
    rowsContainer.innerHTML = '';
    const initNumbers = win && win.numbers && win.numbers.length > 0
      ? win.numbers
      : [{ gameCategory: '', number: '', position: 1 }];
    initNumbers.forEach(n => this._addNumberRow(n));

    document.getElementById('winNumModal').classList.add('active');
    lotSel.focus();
  },

  _closeModal() {
    document.getElementById('winNumModal').classList.remove('active');
    this._editingId = null;
  },

  _openDeleteModal(id, label) {
    this._deletingId = id;
    document.getElementById('delWinNumLabel').textContent = label;
    document.getElementById('winNumDeleteModal').classList.add('active');
  },

  _closeDeleteModal() {
    document.getElementById('winNumDeleteModal').classList.remove('active');
    this._deletingId = null;
  },

  _addNumberRow(data = null) {
    const container = document.getElementById('wnNumberRows');
    const row = document.createElement('div');
    row.className = 'filter-grid';
    row.style.cssText = 'grid-template-columns:1fr 80px 80px 36px;gap:.5rem;margin-bottom:.5rem;align-items:end';

    const gameCatOptions = (this._gameCategories || []).map(g =>
      `<option value="${App.Utils.escHtml(g.gameName)}" ${data && data.gameCategory === g.gameName ? 'selected' : ''}>${App.Utils.escHtml(g.gameName)}</option>`
    ).join('');

    row.innerHTML = `
      <div class="form-group" style="margin:0">
        <label style="font-size:.75rem">Game</label>
        <select class="wn-game">${gameCatOptions || '<option value="">—</option>'}</select>
      </div>
      <div class="form-group" style="margin:0">
        <label style="font-size:.75rem">Number</label>
        <input type="text" class="wn-number" value="${data ? App.Utils.escHtml(data.number) : ''}" placeholder="e.g. 45">
      </div>
      <div class="form-group" style="margin:0">
        <label style="font-size:.75rem">Position</label>
        <input type="number" class="wn-position" value="${data ? data.position : 1}" min="1" max="10">
      </div>
      <button class="btn btn-danger btn-sm wn-remove-row" style="margin-top:1.25rem" title="Remove row"><i class="fas fa-times"></i></button>
    `;

    row.querySelector('.wn-remove-row').addEventListener('click', () => {
      if (container.children.length > 1) {
        container.removeChild(row);
      } else {
        App.Utils.toast('At least one number row is required.', 'error');
      }
    });

    // If game categories not yet loaded, set initial value as text
    if (data && data.gameCategory && !(this._gameCategories || []).length) {
      const sel = row.querySelector('.wn-game');
      const opt = document.createElement('option');
      opt.value = data.gameCategory;
      opt.textContent = data.gameCategory;
      opt.selected = true;
      sel.appendChild(opt);
    }

    container.appendChild(row);
  },

  _collectNumberRows() {
    const rows = document.getElementById('wnNumberRows').querySelectorAll('.filter-grid');
    const numbers = [];
    let valid = true;
    rows.forEach(row => {
      const gameCategory = row.querySelector('.wn-game').value.trim();
      const number       = row.querySelector('.wn-number').value.trim();
      const position     = parseInt(row.querySelector('.wn-position').value, 10);
      if (!gameCategory || !number || isNaN(position)) { valid = false; return; }
      numbers.push({ gameCategory, number, position });
    });
    return { numbers, valid };
  },

  _submit() {
    const lotteryCategoryName = document.getElementById('wnLottery').value;
    const date                = document.getElementById('wnDate').value;
    const { numbers, valid }  = this._collectNumberRows();

    if (!lotteryCategoryName) { App.Utils.toast('Select a lottery.', 'error'); return; }
    if (!date)                { App.Utils.toast('Date is required.', 'error'); return; }
    if (!valid || !numbers.length) { App.Utils.toast('Fill all number rows with valid values.', 'error'); return; }

    const btn = document.getElementById('confirmWinNumBtn');
    btn.disabled = true;

    const payload = { lotteryCategoryName, date, numbers };
    const action = this._editingId
      ? App.Api.updateWinningNumber(this._editingId, payload)
      : App.Api.addWinningNumber(payload);

    action.then(() => {
      this._closeModal();
      this._load();
      App.Utils.toast(this._editingId ? 'Winning numbers updated.' : 'Winning numbers posted.');
    }).catch(err => {
      App.Utils.toast(err.message || 'Failed to save winning numbers.', 'error');
    }).finally(() => { btn.disabled = false; });
  },

  _doDelete() {
    if (!this._deletingId) return;
    const btn = document.getElementById('confirmDelWinNumBtn');
    btn.disabled = true;

    App.Api.deleteWinningNumber(this._deletingId).then(() => {
      this._closeDeleteModal();
      this._load();
      App.Utils.toast('Winning numbers deleted.');
    }).catch(err => {
      App.Utils.toast(err.message || 'Failed to delete winning numbers.', 'error');
    }).finally(() => { btn.disabled = false; });
  },
};
