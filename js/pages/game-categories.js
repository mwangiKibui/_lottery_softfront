/* =====================================================================
   PRINCE LOTO — Game Categories Page  (Admin only)
   Manages game types: BLT, L3C, L4C, etc.
   API: POST/GET/PATCH/DELETE /api/admin/*gamecategory*
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.GameCategories = {
  _editingId: null,

  render() {
    return `
      <div class="page-card">
        <div class="page-card-header">
          <h2><i class="fas fa-dice"></i> Game Categories</h2>
          <button class="btn btn-gradient btn-sm" id="openGameCatModalBtn">
            <i class="fas fa-plus-circle"></i> New Game Type
          </button>
        </div>
        <hr class="divider">

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Game Name</th>
                <th>Positions</th>
                <th>Number Length</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="gameCatTableBody">
              ${App.Utils.tableLoadingRow(4)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <div id="gameCatModal" class="modal-overlay">
        <div class="modal-container" style="max-width:420px">
          <div class="modal-header">
            <h3 id="gameCatModalTitle"><i class="fas fa-dice"></i> New Game Type</h3>
            <button class="modal-close" id="closeGameCatModalBtn" aria-label="Close"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-grid" style="grid-template-columns:1fr">
            <div class="form-group">
              <label>Game Name <span class="required">*</span></label>
              <input type="text" id="gcGameName" placeholder="e.g. BLT">
            </div>
            <div class="form-group">
              <label>Positions <span class="required">*</span></label>
              <input type="number" id="gcPositions" placeholder="e.g. 3" min="1">
            </div>
            <div class="form-group">
              <label>Required Number Length <span class="required">*</span></label>
              <input type="number" id="gcRequiredLength" placeholder="e.g. 2" min="1">
            </div>
          </div>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelGameCatModalBtn">Cancel</button>
            <button class="btn btn-primary" id="confirmGameCatBtn"><i class="fas fa-save"></i> Save</button>
          </div>
        </div>
      </div>

      <!-- Confirm Delete Modal -->
      <div id="gameCatDeleteModal" class="modal-overlay">
        <div class="modal-container" style="max-width:380px">
          <div class="modal-header">
            <h3><i class="fas fa-trash-alt"></i> Delete Game Category</h3>
            <button class="modal-close" id="closeDelGameCatBtn" aria-label="Close"><i class="fas fa-times"></i></button>
          </div>
          <p style="padding:0 1.5rem 1rem">Are you sure you want to delete <strong id="delGameCatName"></strong>? This cannot be undone.</p>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelDelGameCatBtn">Cancel</button>
            <button class="btn btn-danger" id="confirmDelGameCatBtn"><i class="fas fa-trash-alt"></i> Delete</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this._editingId = null;
    this._load();

    document.getElementById('openGameCatModalBtn').addEventListener('click', () => this._openModal());
    document.getElementById('closeGameCatModalBtn').addEventListener('click', () => this._closeModal());
    document.getElementById('cancelGameCatModalBtn').addEventListener('click', () => this._closeModal());
    document.getElementById('gameCatModal').addEventListener('click', e => { if (e.target === e.currentTarget) this._closeModal(); });
    document.getElementById('confirmGameCatBtn').addEventListener('click', () => this._submit());

    document.getElementById('closeDelGameCatBtn').addEventListener('click', () => this._closeDeleteModal());
    document.getElementById('cancelDelGameCatBtn').addEventListener('click', () => this._closeDeleteModal());
    document.getElementById('gameCatDeleteModal').addEventListener('click', e => { if (e.target === e.currentTarget) this._closeDeleteModal(); });
    document.getElementById('confirmDelGameCatBtn').addEventListener('click', () => this._doDelete());
  },

  _load() {
    const tbody = document.getElementById('gameCatTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(4);

    App.Api.getGameCategories().then(cats => {
      if (!cats || cats.length === 0) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No game categories found.', 4);
        return;
      }
      tbody.innerHTML = cats.map(c => `
        <tr>
          <td><strong>${App.Utils.escHtml(c.gameName)}</strong></td>
          <td>${App.Utils.escHtml(String(c.positions))}</td>
          <td>${App.Utils.escHtml(String(c.requiredLength))} digit(s)</td>
          <td>
            <button class="btn btn-ghost btn-sm" data-edit="${App.Utils.escHtml(c._id)}"
              data-name="${App.Utils.escHtml(c.gameName)}"
              data-positions="${App.Utils.escHtml(String(c.positions))}"
              data-length="${App.Utils.escHtml(String(c.requiredLength))}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger btn-sm" data-delete="${App.Utils.escHtml(c._id)}" data-name="${App.Utils.escHtml(c.gameName)}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', () => this._openModal({
          _id: btn.dataset.edit,
          gameName: btn.dataset.name,
          positions: btn.dataset.positions,
          requiredLength: btn.dataset.length,
        }));
      });
      tbody.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => this._openDeleteModal(btn.dataset.delete, btn.dataset.name));
      });
    }).catch(err => {
      tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load game categories.', 4);
      App.Utils.toast(err.message || 'Error loading game categories.', 'error');
    });
  },

  _openModal(cat = null) {
    this._editingId = cat ? cat._id : null;
    document.getElementById('gameCatModalTitle').innerHTML = cat
      ? '<i class="fas fa-edit"></i> Edit Game Type'
      : '<i class="fas fa-dice"></i> New Game Type';
    document.getElementById('gcGameName').value       = cat ? cat.gameName       : '';
    document.getElementById('gcPositions').value      = cat ? cat.positions      : '';
    document.getElementById('gcRequiredLength').value = cat ? cat.requiredLength : '';
    document.getElementById('gameCatModal').classList.add('active');
    document.getElementById('gcGameName').focus();
  },

  _closeModal() {
    document.getElementById('gameCatModal').classList.remove('active');
    this._editingId = null;
  },

  _openDeleteModal(id, name) {
    this._deletingId = id;
    document.getElementById('delGameCatName').textContent = name;
    document.getElementById('gameCatDeleteModal').classList.add('active');
  },

  _closeDeleteModal() {
    document.getElementById('gameCatDeleteModal').classList.remove('active');
    this._deletingId = null;
  },

  _submit() {
    const gameName       = document.getElementById('gcGameName').value.trim();
    const positions      = parseInt(document.getElementById('gcPositions').value, 10);
    const requiredLength = parseInt(document.getElementById('gcRequiredLength').value, 10);

    if (!gameName || isNaN(positions) || isNaN(requiredLength) || positions < 1 || requiredLength < 1) {
      App.Utils.toast('Please fill all required fields with valid values.', 'error');
      return;
    }

    const btn = document.getElementById('confirmGameCatBtn');
    btn.disabled = true;

    const payload = { gameName, positions, requiredLength };
    const action = this._editingId
      ? App.Api.updateGameCategory(this._editingId, payload)
      : App.Api.createGameCategory(payload);

    action.then(() => {
      this._closeModal();
      this._load();
      App.Utils.toast(this._editingId ? 'Game category updated.' : `Game category "${gameName}" added.`);
    }).catch(err => {
      App.Utils.toast(err.message || 'Failed to save game category.', 'error');
    }).finally(() => { btn.disabled = false; });
  },

  _doDelete() {
    if (!this._deletingId) return;
    const btn = document.getElementById('confirmDelGameCatBtn');
    btn.disabled = true;

    App.Api.deleteGameCategory(this._deletingId).then(() => {
      this._closeDeleteModal();
      this._load();
      App.Utils.toast('Game category deleted.');
    }).catch(err => {
      App.Utils.toast(err.message || 'Failed to delete game category.', 'error');
    }).finally(() => { btn.disabled = false; });
  },
};
