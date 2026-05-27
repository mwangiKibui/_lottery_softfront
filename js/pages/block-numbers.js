/* =====================================================================
   PRINCE LOTO — Block Numbers Page  (Sub-Admin only)
   Real API: GET/POST/PATCH/DELETE /api/subadmin/*blocknumber*
   Block number doc: { _id, subAdmin, lotteryCategoryName, gameCategory, number }
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.BlockNumbers = {
  _editingId:    null,
  _deletingId:   null,
  _deletingLabel:'',
  _lotteries:    [],
  _gameCats:     [],

  render() {
    return `
      <div class="page-card">
        <div class="page-card-header">
          <h2><i class="fas fa-ban"></i> Block Numbers</h2>
          <button class="btn btn-gradient btn-sm" id="openBlockModalBtn">
            <i class="fas fa-plus-circle"></i> Block Number
          </button>
        </div>
        <hr class="divider">

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Lottery</th>
                <th>Game Category</th>
                <th>Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="blockTableBody">
              ${App.Utils.tableLoadingRow(4)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Block Number Modal -->
      <div id="blockModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 id="blockModalTitle"><i class="fas fa-ban"></i> Block Number</h3>
            <button class="modal-close" id="closeBlockModalBtn"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-grid">
            <div class="form-group">
              <label>Lottery <span class="required">*</span></label>
              <select id="mBlockLottery">
                <option value="">— Select Lottery —</option>
              </select>
            </div>
            <div class="form-group">
              <label>Game Category <span class="required">*</span></label>
              <select id="mBlockGameCat">
                <option value="">— Select Game —</option>
              </select>
            </div>
            <div class="form-group">
              <label>Number <span class="required">*</span></label>
              <input type="text" id="mBlockNumber" placeholder="e.g. 42">
            </div>
          </div>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelBlockModalBtn">Cancel</button>
            <button class="btn btn-primary" id="confirmBlockBtn">
              <i class="fas fa-save"></i> Save
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div id="deleteBlockModal" class="modal-overlay">
        <div class="modal-container modal-sm">
          <div class="modal-header">
            <h3><i class="fas fa-trash-alt"></i> Confirm Delete</h3>
            <button class="modal-close" id="closeDeleteBlockBtn"><i class="fas fa-times"></i></button>
          </div>
          <p style="margin:16px 0 24px;">Unblock number <strong id="deleteBlockLabel"></strong>?</p>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelDeleteBlockBtn">Cancel</button>
            <button class="btn btn-danger" id="confirmDeleteBlockBtn">
              <i class="fas fa-trash-alt"></i> Unblock
            </button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this._editingId  = null;
    this._deletingId = null;

    // Load reference data + block numbers simultaneously
    Promise.all([
      App.Api.getGameCategories().catch(() => []),
      App.Api.getLotteryCategories().catch(() => []),
    ]).then(([gameCats, lotteries]) => {
      this._gameCats  = Array.isArray(gameCats)  ? gameCats  : [];
      this._lotteries = Array.isArray(lotteries) ? lotteries : [];
      this._populateModalDropdowns();
      this._load();
    });

    // Modal controls
    document.getElementById('openBlockModalBtn').addEventListener('click', () => this._openCreate());
    ['closeBlockModalBtn','cancelBlockModalBtn'].forEach(id =>
      document.getElementById(id).addEventListener('click', () => this._closeModal())
    );
    document.getElementById('blockModal').addEventListener('click', e => {
      if (e.target === e.currentTarget) this._closeModal();
    });
    document.getElementById('confirmBlockBtn').addEventListener('click', () => this._submit());

    // Delete modal
    ['closeDeleteBlockBtn','cancelDeleteBlockBtn'].forEach(id =>
      document.getElementById(id).addEventListener('click', () =>
        document.getElementById('deleteBlockModal').classList.remove('active'))
    );
    document.getElementById('confirmDeleteBlockBtn').addEventListener('click', () => this._confirmDelete());
  },

  _populateModalDropdowns() {
    const lotSel = document.getElementById('mBlockLottery');
    if (lotSel) {
      lotSel.innerHTML = '<option value="">— Select Lottery —</option>' +
        this._lotteries.map(l => `<option value="${App.Utils.escHtml(l.lotteryName)}">${App.Utils.escHtml(l.lotteryName)}</option>`).join('');
    }
    const gamSel = document.getElementById('mBlockGameCat');
    if (gamSel) {
      gamSel.innerHTML = '<option value="">— Select Game —</option>' +
        this._gameCats.map(g => `<option value="${App.Utils.escHtml(g.gameName)}">${App.Utils.escHtml(g.gameName)}</option>`).join('');
    }
  },

  _load() {
    const tbody = document.getElementById('blockTableBody');
    if (tbody) tbody.innerHTML = App.Utils.tableLoadingRow(4);

    App.Api.getBlockNumbers().then(blocks => {
      if (!blocks || !blocks.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No blocked numbers. Click "Block Number" to add one.', 4);
        return;
      }

      tbody.innerHTML = blocks.map(b => `
        <tr>
          <td>${App.Utils.escHtml(b.lotteryCategoryName || '—')}</td>
          <td>${App.Utils.escHtml(b.gameCategory || '—')}</td>
          <td><strong>${App.Utils.escHtml(b.number || '—')}</strong></td>
          <td>
            <button class="btn btn-ghost btn-sm" data-edit="${App.Utils.escHtml(b._id)}"
              data-lottery="${App.Utils.escHtml(b.lotteryCategoryName || '')}"
              data-game="${App.Utils.escHtml(b.gameCategory || '')}"
              data-number="${App.Utils.escHtml(b.number || '')}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger btn-sm" data-delete="${App.Utils.escHtml(b._id)}"
              data-label="${App.Utils.escHtml(b.lotteryCategoryName + ' / ' + b.gameCategory + ' #' + b.number)}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', () => this._openEdit({
          _id:                 btn.dataset.edit,
          lotteryCategoryName: btn.dataset.lottery,
          gameCategory:        btn.dataset.game,
          number:              btn.dataset.number,
        }));
      });

      tbody.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => this._openDeleteModal(btn.dataset.delete, btn.dataset.label));
      });
    }).catch(err => {
      if (tbody) tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load block numbers.', 4);
      App.Utils.toast(err.message || 'Error loading block numbers.', 'error');
    });
  },

  _openCreate() {
    this._editingId = null;
    document.getElementById('blockModalTitle').innerHTML = '<i class="fas fa-ban"></i> Block Number';
    document.getElementById('mBlockLottery').value = '';
    document.getElementById('mBlockGameCat').value = '';
    document.getElementById('mBlockNumber').value  = '';
    document.getElementById('blockModal').classList.add('active');
  },

  _openEdit(block) {
    this._editingId = block._id;
    document.getElementById('blockModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Blocked Number';
    document.getElementById('mBlockLottery').value = block.lotteryCategoryName || '';
    document.getElementById('mBlockGameCat').value = block.gameCategory        || '';
    document.getElementById('mBlockNumber').value  = block.number              || '';
    document.getElementById('blockModal').classList.add('active');
  },

  _openDeleteModal(id, label) {
    this._deletingId    = id;
    this._deletingLabel = label;
    document.getElementById('deleteBlockLabel').textContent = label;
    document.getElementById('deleteBlockModal').classList.add('active');
  },

  _closeModal() {
    document.getElementById('blockModal').classList.remove('active');
  },

  _submit() {
    const isEdit = !!this._editingId;
    const lottery = document.getElementById('mBlockLottery').value;
    const game    = document.getElementById('mBlockGameCat').value;
    const number  = document.getElementById('mBlockNumber').value.trim();

    if (!lottery || !game || !number) {
      App.Utils.toast('All fields are required.', 'error');
      return;
    }

    const payload = { lotteryCategoryName: lottery, gameCategory: game, number };
    const confirmBtn = document.getElementById('confirmBlockBtn');
    confirmBtn.disabled = true;

    const action = isEdit
      ? App.Api.updateBlockNumber(this._editingId, payload)
      : App.Api.addBlockNumber(payload);

    action.then(() => {
      this._closeModal();
      this._load();
      App.Utils.toast(`Block number ${isEdit ? 'updated' : 'added'} successfully.`);
    }).catch(err => {
      App.Utils.toast(err.message || 'Operation failed.', 'error');
    }).finally(() => { confirmBtn.disabled = false; });
  },

  _confirmDelete() {
    const confirmBtn = document.getElementById('confirmDeleteBlockBtn');
    confirmBtn.disabled = true;

    App.Api.deleteBlockNumber(this._deletingId).then(() => {
      document.getElementById('deleteBlockModal').classList.remove('active');
      this._load();
      App.Utils.toast(`"${this._deletingLabel}" unblocked.`);
    }).catch(err => {
      App.Utils.toast(err.message || 'Delete failed.', 'error');
    }).finally(() => { confirmBtn.disabled = false; });
  },
};
