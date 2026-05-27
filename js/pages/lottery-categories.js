/* =====================================================================
   PRINCE LOTO — Lottery Categories Page  (Admin only)
   Manages lottery schedules: Midi, Soir, etc.
   API: POST/GET/PATCH/DELETE /api/admin/*lotterycategory*
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.LotteryCategories = {
  _editingId:  null,
  _deletingId: null,
  _allCats:    [],

  render() {
    return `
      <div class="page-card">
        <div class="page-card-header">
          <h2><i class="fas fa-calendar-alt"></i> Lottery Schedules</h2>
          <button class="btn btn-gradient btn-sm" id="openLotCatModalBtn">
            <i class="fas fa-plus-circle"></i> New Schedule
          </button>
        </div>
        <hr class="divider">

        <!-- Search -->
        <div class="search-bar-row" style="margin-bottom:1rem">
          <div class="search-input-wrap">
            <i class="fas fa-search search-icon"></i>
            <input type="search" id="lotCatSearch" placeholder="Search lottery schedules…" class="search-input">
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Lottery Name</th>
                <th>Start Time</th>
                <th>End Time (Cut-off)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="lotCatTableBody">
              ${App.Utils.tableLoadingRow(4)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <div id="lotCatModal" class="modal-overlay">
        <div class="modal-container" style="max-width:420px">
          <div class="modal-header">
            <h3 id="lotCatModalTitle"><i class="fas fa-calendar-alt"></i> New Schedule</h3>
            <button class="modal-close" id="closeLotCatModalBtn" aria-label="Close"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-grid" style="grid-template-columns:1fr">
            <div class="form-group">
              <label>Lottery Name <span class="required">*</span></label>
              <input type="text" id="lcLotteryName" placeholder="e.g. Midi">
            </div>
            <div class="form-group">
              <label>Start Time</label>
              <input type="time" id="lcStartTime">
            </div>
            <div class="form-group">
              <label>End Time (ticket cut-off)</label>
              <input type="time" id="lcEndTime">
            </div>
          </div>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelLotCatModalBtn">Cancel</button>
            <button class="btn btn-primary" id="confirmLotCatBtn"><i class="fas fa-save"></i> Save</button>
          </div>
        </div>
      </div>

      <!-- Confirm Delete Modal -->
      <div id="lotCatDeleteModal" class="modal-overlay">
        <div class="modal-container" style="max-width:380px">
          <div class="modal-header">
            <h3><i class="fas fa-trash-alt"></i> Delete Lottery Schedule</h3>
            <button class="modal-close" id="closeDelLotCatBtn" aria-label="Close"><i class="fas fa-times"></i></button>
          </div>
          <p style="padding:0 1.5rem 1rem">Are you sure you want to delete <strong id="delLotCatName"></strong>? This cannot be undone.</p>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelDelLotCatBtn">Cancel</button>
            <button class="btn btn-danger" id="confirmDelLotCatBtn"><i class="fas fa-trash-alt"></i> Delete</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this._editingId  = null;
    this._deletingId = null;
    this._load();

    document.getElementById('openLotCatModalBtn').addEventListener('click', () => this._openModal());
    document.getElementById('closeLotCatModalBtn').addEventListener('click', () => this._closeModal());
    document.getElementById('cancelLotCatModalBtn').addEventListener('click', () => this._closeModal());
    document.getElementById('lotCatModal').addEventListener('click', e => { if (e.target === e.currentTarget) this._closeModal(); });
    document.getElementById('confirmLotCatBtn').addEventListener('click', () => this._submit());

    document.getElementById('closeDelLotCatBtn').addEventListener('click', () => this._closeDeleteModal());
    document.getElementById('cancelDelLotCatBtn').addEventListener('click', () => this._closeDeleteModal());
    document.getElementById('lotCatDeleteModal').addEventListener('click', e => { if (e.target === e.currentTarget) this._closeDeleteModal(); });
    document.getElementById('confirmDelLotCatBtn').addEventListener('click', () => this._doDelete());

    document.getElementById('lotCatSearch').addEventListener('input', e => {
      this._filterTable(e.target.value.trim());
    });
  },

  _load() {
    const tbody = document.getElementById('lotCatTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(4);

    App.Api.getLotteryCategories().then(cats => {
      this._allCats = cats || [];
      this._renderTable(this._allCats);
    }).catch(err => {
      tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load lottery schedules.', 4);
      App.Utils.toast(err.message || 'Error loading lottery schedules.', 'error');
    });
  },

  _renderTable(cats) {
    const tbody = document.getElementById('lotCatTableBody');
    if (!cats || cats.length === 0) {
      tbody.innerHTML = App.Utils.tableEmptyRow('No lottery schedules found.', 4);
      return;
    }
    tbody.innerHTML = cats.map(c => `
      <tr>
        <td><strong>${App.Utils.escHtml(c.lotteryName)}</strong></td>
        <td>${App.Utils.escHtml(c.startTime || '—')}</td>
        <td>${App.Utils.escHtml(c.endTime   || '—')}</td>
        <td>
          <button class="btn btn-ghost btn-sm" data-edit="${App.Utils.escHtml(c._id)}"
            data-name="${App.Utils.escHtml(c.lotteryName)}"
            data-start="${App.Utils.escHtml(c.startTime || '')}"
            data-end="${App.Utils.escHtml(c.endTime || '')}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-danger btn-sm" data-delete="${App.Utils.escHtml(c._id)}" data-name="${App.Utils.escHtml(c.lotteryName)}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => this._openModal({
        _id: btn.dataset.edit,
        lotteryName: btn.dataset.name,
        startTime:   btn.dataset.start,
        endTime:     btn.dataset.end,
      }));
    });
    tbody.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => this._openDeleteModal(btn.dataset.delete, btn.dataset.name));
    });
  },

  _filterTable(query) {
    if (!query) { this._renderTable(this._allCats); return; }
    const q = query.toLowerCase();
    this._renderTable(this._allCats.filter(c => (c.lotteryName || '').toLowerCase().includes(q)));
  },

  _openModal(cat = null) {
    this._editingId = cat ? cat._id : null;
    document.getElementById('lotCatModalTitle').innerHTML = cat
      ? '<i class="fas fa-edit"></i> Edit Schedule'
      : '<i class="fas fa-calendar-alt"></i> New Schedule';
    document.getElementById('lcLotteryName').value = cat ? cat.lotteryName : '';
    document.getElementById('lcStartTime').value   = cat ? cat.startTime   : '';
    document.getElementById('lcEndTime').value     = cat ? cat.endTime     : '';
    document.getElementById('lotCatModal').classList.add('active');
    document.getElementById('lcLotteryName').focus();
  },

  _closeModal() {
    document.getElementById('lotCatModal').classList.remove('active');
    this._editingId = null;
  },

  _openDeleteModal(id, name) {
    this._deletingId = id;
    document.getElementById('delLotCatName').textContent = name;
    document.getElementById('lotCatDeleteModal').classList.add('active');
  },

  _closeDeleteModal() {
    document.getElementById('lotCatDeleteModal').classList.remove('active');
    this._deletingId = null;
  },

  _submit() {
    const lotteryName = document.getElementById('lcLotteryName').value.trim();
    const startTime   = document.getElementById('lcStartTime').value;
    const endTime     = document.getElementById('lcEndTime').value;

    if (!lotteryName) {
      App.Utils.toast('Lottery name is required.', 'error');
      return;
    }

    const btn = document.getElementById('confirmLotCatBtn');
    btn.disabled = true;

    const payload = { lotteryName, startTime, endTime };
    const action = this._editingId
      ? App.Api.updateLotteryCategory(this._editingId, payload)
      : App.Api.createLotteryCategory(payload);

    action.then(() => {
      this._closeModal();
      this._load();
      App.Utils.toast(this._editingId ? 'Lottery schedule updated.' : `Schedule "${lotteryName}" added.`);
    }).catch(err => {
      App.Utils.toast(err.message || 'Failed to save lottery schedule.', 'error');
    }).finally(() => { btn.disabled = false; });
  },

  _doDelete() {
    if (!this._deletingId) return;
    const btn = document.getElementById('confirmDelLotCatBtn');
    btn.disabled = true;

    App.Api.deleteLotteryCategory(this._deletingId).then(() => {
      this._closeDeleteModal();
      this._load();
      App.Utils.toast('Lottery schedule deleted.');
    }).catch(err => {
      App.Utils.toast(err.message || 'Failed to delete lottery schedule.', 'error');
    }).finally(() => { btn.disabled = false; });
  },
};
