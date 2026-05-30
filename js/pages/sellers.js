/* =====================================================================
   PRINCE LOTO — Sellers Page  (Sub-Admin only)
   Manage sellers: create, edit, delete + bonus flag toggle.
   API: GET/POST/PATCH/DELETE /api/subadmin/*seller*
        PATCH /api/subadmin/updateBonusFlag
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Sellers = {
  _editingId:  null,
  _deletingId: null,
  _deletingName: '',
  _supervisors: [],

  render() {
    return `
      <div class="page-card">
        <div class="page-card-header">
          <h2><i class="fas fa-users"></i> Sellers (Vendeurs)</h2>
          <button class="btn btn-gradient btn-sm" id="openSellerModalBtn">
            <i class="fas fa-plus-circle"></i> New Seller
          </button>
        </div>
        <hr class="divider">

        <!-- Bonus flag toggle -->
        <div class="filter-card" style="margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
            <span style="font-weight:600; font-size:0.9rem;"><i class="fas fa-gift" style="color:var(--clr-gold-500)"></i> Bonus for Sellers</span>
            <label class="toggle-switch">
              <input type="checkbox" id="bonusFlagToggle">
              <span class="toggle-slider"></span>
            </label>
            <span id="bonusFlagLabel" style="font-size:0.85rem; color:var(--clr-warm-600)">Loading…</span>
          </div>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>IMEI</th>
                <th>Supervisor</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="sellersTableBody">
              ${App.Utils.tableLoadingRow(6)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Seller Modal -->
      <div id="sellerModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 id="sellerModalTitle"><i class="fas fa-user-plus"></i> New Seller</h3>
            <button class="modal-close" id="closeSellerModalBtn" aria-label="Close"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-grid">
            <div class="form-group">
              <label>Username <span class="required">*</span></label>
              <input type="text" id="mSellerUserName" placeholder="Seller username" autocomplete="off">
            </div>
            <div class="form-group" id="mSellerPasswordGroup">
              <label id="mSellerPasswordLabel">Password <span class="required">*</span></label>
              <input type="password" id="mSellerPassword" placeholder="Password" autocomplete="new-password">
            </div>
            <div class="form-group">
              <label>IMEI <span class="required">*</span></label>
              <input type="text" id="mSellerImei" placeholder="Device IMEI number">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="mSellerEmail" placeholder="Email address">
            </div>
            <div class="form-group">
              <label>Supervisor</label>
              <select id="mSellerSupervisor">
                <option value="">— None —</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select id="mSellerActive">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelSellerModalBtn">Cancel</button>
            <button class="btn btn-primary" id="confirmSellerBtn">
              <i class="fas fa-save"></i> Save
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div id="deleteSellerModal" class="modal-overlay">
        <div class="modal-container modal-sm">
          <div class="modal-header">
            <h3><i class="fas fa-trash-alt"></i> Confirm Delete</h3>
            <button class="modal-close" id="closeDeleteSellerBtn"><i class="fas fa-times"></i></button>
          </div>
          <p style="margin:16px 0 24px;">Delete seller <strong id="deleteSellerNameLabel"></strong>?<br>
          <small style="color:var(--clr-warm-600)">This action cannot be undone.</small></p>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelDeleteSellerBtn">Cancel</button>
            <button class="btn btn-danger" id="confirmDeleteSellerBtn">
              <i class="fas fa-trash-alt"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this._editingId  = null;
    this._deletingId = null;

    // Load supervisors first, then sellers
    this._loadSupervisors().then(() => this._load());

    // Modal open/close
    document.getElementById('openSellerModalBtn').addEventListener('click', () => this._openCreate());
    ['closeSellerModalBtn', 'cancelSellerModalBtn'].forEach(id =>
      document.getElementById(id).addEventListener('click', () => this._closeModal())
    );
    document.getElementById('sellerModal').addEventListener('click', e => {
      if (e.target === e.currentTarget) this._closeModal();
    });
    document.getElementById('confirmSellerBtn').addEventListener('click', () => this._submit());

    // Delete modal
    ['closeDeleteSellerBtn', 'cancelDeleteSellerBtn'].forEach(id =>
      document.getElementById(id).addEventListener('click', () =>
        document.getElementById('deleteSellerModal').classList.remove('active'))
    );
    document.getElementById('confirmDeleteSellerBtn').addEventListener('click', () => this._confirmDelete());

    // Bonus flag toggle
    document.getElementById('bonusFlagToggle').addEventListener('change', e => {
      const newVal = e.target.checked;
      App.Api.updateBonusFlag(newVal).then(() => {
        App.Utils.toast(`Bonus ${newVal ? 'enabled' : 'disabled'} successfully.`);
        document.getElementById('bonusFlagLabel').textContent = newVal ? 'Bonus is ON' : 'Bonus is OFF';
      }).catch(() => {
        e.target.checked = !newVal; // revert on error
        App.Utils.toast('Failed to update bonus flag.', 'error');
      });
    });
  },

  _loadSupervisors() {
    return App.Api.getSupervisors().then(data => {
      this._supervisors = Array.isArray(data) ? data : [];
    }).catch(() => { this._supervisors = []; });
  },

  _load() {
    const tbody = document.getElementById('sellersTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(6);

    App.Api.getSellers().then(({ users, bonusFlag }) => {
      // Set bonus flag UI
      const toggle = document.getElementById('bonusFlagToggle');
      if (toggle) {
        toggle.checked = !!bonusFlag;
        document.getElementById('bonusFlagLabel').textContent = bonusFlag ? 'Bonus is ON' : 'Bonus is OFF';
      }

      // Populate supervisor dropdown
      this._populateSupDropdown();

      if (!users || !users.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No sellers yet. Click "New Seller" to add one.', 6);
        return;
      }

      tbody.innerHTML = users.map(s => `
        <tr>
          <td><strong>${App.Utils.escHtml(s.userName)}</strong></td>
          <td><code style="font-size:0.8rem">${App.Utils.escHtml(s.imei || '—')}</code></td>
          <td>${App.Utils.escHtml(s.superVisorName || '—')}</td>
          <td>${App.Utils.escHtml(s.email || '—')}</td>
          <td>${App.Utils.badge(s.isActive ? 'Active' : 'Inactive', s.isActive ? 'success' : 'neutral')}</td>
          <td>
            <button class="btn btn-ghost btn-sm" data-edit="${App.Utils.escHtml(s._id)}"
              data-username="${App.Utils.escHtml(s.userName)}"
              data-imei="${App.Utils.escHtml(s.imei || '')}"
              data-email="${App.Utils.escHtml(s.email || '')}"
              data-supervisor="${App.Utils.escHtml(s.superVisorName || '')}"
              data-active="${s.isActive ? 'true' : 'false'}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger btn-sm" data-delete="${App.Utils.escHtml(s._id)}"
              data-name="${App.Utils.escHtml(s.userName)}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', () => this._openEdit({
          _id:           btn.dataset.edit,
          userName:      btn.dataset.username,
          imei:          btn.dataset.imei,
          email:         btn.dataset.email,
          superVisorName: btn.dataset.supervisor,
          isActive:      btn.dataset.active === 'true',
        }));
      });

      tbody.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => this._openDeleteModal(btn.dataset.delete, btn.dataset.name));
      });
    }).catch(err => {
      tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load sellers.', 6);
      App.Utils.toast(err.message || 'Error loading sellers.', 'error');
    });
  },

  _populateSupDropdown() {
    const sel = document.getElementById('mSellerSupervisor');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">— None —</option>' +
      this._supervisors.map(s => `<option value="${App.Utils.escHtml(s.userName)}">${App.Utils.escHtml(s.userName)}</option>`).join('');
    sel.value = current;
  },

  _openCreate() {
    this._editingId = null;
    document.getElementById('sellerModalTitle').innerHTML = '<i class="fas fa-user-plus"></i> New Seller';
    document.getElementById('mSellerPasswordLabel').innerHTML = 'Password <span class="required">*</span>';
    document.getElementById('mSellerUserName').value    = '';
    document.getElementById('mSellerPassword').value    = '';
    document.getElementById('mSellerImei').value        = '';
    document.getElementById('mSellerEmail').value       = '';
    document.getElementById('mSellerSupervisor').value  = '';
    document.getElementById('mSellerActive').value      = 'true';
    this._populateSupDropdown();
    document.getElementById('sellerModal').classList.add('active');
  },

  _openEdit(seller) {
    this._editingId = seller._id;
    document.getElementById('sellerModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Seller';
    document.getElementById('mSellerPasswordLabel').innerHTML = 'New Password <small style="color:var(--clr-warm-500); font-weight:400">(leave blank to keep)</small>';
    document.getElementById('mSellerUserName').value    = seller.userName    || '';
    document.getElementById('mSellerPassword').value    = '';
    document.getElementById('mSellerImei').value        = seller.imei        || '';
    document.getElementById('mSellerEmail').value       = seller.email       || '';
    document.getElementById('mSellerActive').value      = seller.isActive ? 'true' : 'false';
    this._populateSupDropdown();
    document.getElementById('mSellerSupervisor').value  = seller.superVisorName || '';
    document.getElementById('sellerModal').classList.add('active');
  },

  _openDeleteModal(id, name) {
    this._deletingId   = id;
    this._deletingName = name;
    document.getElementById('deleteSellerNameLabel').textContent = name;
    document.getElementById('deleteSellerModal').classList.add('active');
  },

  _closeModal() {
    document.getElementById('sellerModal').classList.remove('active');
  },

  _submit() {
    const isEdit       = !!this._editingId;
    const userName     = document.getElementById('mSellerUserName').value.trim();
    const password     = document.getElementById('mSellerPassword').value.trim();
    const imei         = document.getElementById('mSellerImei').value.trim();
    const email        = document.getElementById('mSellerEmail').value.trim();
    const superVisorName = document.getElementById('mSellerSupervisor').value;
    const isActive     = document.getElementById('mSellerActive').value === 'true';

    if (!userName || !imei) {
      App.Utils.toast('Username and IMEI are required.', 'error');
      return;
    }
    if (!isEdit && !password) {
      App.Utils.toast('Password is required for new sellers.', 'error');
      return;
    }

    const payload = { userName, imei, email, isActive, superVisorName };
    if (password) payload.password = password;

    const confirmBtn = document.getElementById('confirmSellerBtn');
    confirmBtn.disabled = true;

    const action = isEdit
      ? App.Api.updateSeller(this._editingId, payload)
      : App.Api.createSeller(payload);

    action.then(() => {
      this._closeModal();
      this._load();
      App.Utils.toast(`Seller ${isEdit ? 'updated' : 'added'} successfully.`);
    }).catch(err => {
      App.Utils.toast(err.message || 'Operation failed.', 'error');
    }).finally(() => { confirmBtn.disabled = false; });
  },

  _confirmDelete() {
    const confirmBtn = document.getElementById('confirmDeleteSellerBtn');
    confirmBtn.disabled = true;

    App.Api.deleteSeller(this._deletingId).then(() => {
      document.getElementById('deleteSellerModal').classList.remove('active');
      this._load();
      App.Utils.toast(`Seller "${this._deletingName}" deleted.`);
    }).catch(err => {
      App.Utils.toast(err.message || 'Delete failed.', 'error');
    }).finally(() => { confirmBtn.disabled = false; });
  },
};

