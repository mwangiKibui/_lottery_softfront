/* =====================================================================
   PRINCE LOTO — Supervisors Page  (Sub-Admin only)
   Manage supervisors: create, edit, delete.
   API: GET/POST/PATCH/DELETE /api/subadmin/*superVisor*
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Supervisors = {
  _editingId:    null,
  _deletingId:   null,
  _deletingName: '',

  render() {
    return `
      <div class="page-card">
        <div class="page-card-header">
          <h2><i class="fas fa-user-tie"></i> Supervisors (Superviseurs)</h2>
          <button class="btn btn-gradient btn-sm" id="openSupModalBtn">
            <i class="fas fa-plus-circle"></i> New Supervisor
          </button>
        </div>
        <hr class="divider">

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="supTableBody">
              ${App.Utils.tableLoadingRow(4)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Supervisor Modal -->
      <div id="supervisorModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 id="supModalTitle"><i class="fas fa-user-tie"></i> New Supervisor</h3>
            <button class="modal-close" id="closeSupModalBtn" aria-label="Close"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-grid">
            <div class="form-group">
              <label>Username <span class="required">*</span></label>
              <input type="text" id="mSupUserName" placeholder="Supervisor username" autocomplete="off">
            </div>
            <div class="form-group">
              <label id="mSupPasswordLabel">Password <span class="required">*</span></label>
              <input type="password" id="mSupPassword" placeholder="Password" autocomplete="new-password">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="mSupEmail" placeholder="Email address">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select id="mSupActive">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelSupModalBtn">Cancel</button>
            <button class="btn btn-primary" id="confirmSupBtn">
              <i class="fas fa-save"></i> Save
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div id="deleteSupModal" class="modal-overlay">
        <div class="modal-container modal-sm">
          <div class="modal-header">
            <h3><i class="fas fa-trash-alt"></i> Confirm Delete</h3>
            <button class="modal-close" id="closeDeleteSupBtn"><i class="fas fa-times"></i></button>
          </div>
          <p style="margin:16px 0 24px;">Delete supervisor <strong id="deleteSupNameLabel"></strong>?<br>
          <small style="color:var(--clr-warm-600)">This action cannot be undone.</small></p>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelDeleteSupBtn">Cancel</button>
            <button class="btn btn-danger" id="confirmDeleteSupBtn">
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
    this._load();

    document.getElementById('openSupModalBtn').addEventListener('click', () => this._openCreate());
    ['closeSupModalBtn', 'cancelSupModalBtn'].forEach(id =>
      document.getElementById(id).addEventListener('click', () => this._closeModal())
    );
    document.getElementById('supervisorModal').addEventListener('click', e => {
      if (e.target === e.currentTarget) this._closeModal();
    });
    document.getElementById('confirmSupBtn').addEventListener('click', () => this._submit());

    ['closeDeleteSupBtn', 'cancelDeleteSupBtn'].forEach(id =>
      document.getElementById(id).addEventListener('click', () =>
        document.getElementById('deleteSupModal').classList.remove('active'))
    );
    document.getElementById('confirmDeleteSupBtn').addEventListener('click', () => this._confirmDelete());
  },

  _load() {
    const tbody = document.getElementById('supTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(4);

    App.Api.getSupervisors().then(sups => {
      if (!sups || !sups.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No supervisors yet. Click "New Supervisor" to add one.', 4);
        return;
      }
      tbody.innerHTML = sups.map(s => `
        <tr>
          <td><strong>${App.Utils.escHtml(s.userName)}</strong></td>
          <td>${App.Utils.escHtml(s.email || '—')}</td>
          <td>${App.Utils.badge(s.isActive ? 'Active' : 'Inactive', s.isActive ? 'success' : 'neutral')}</td>
          <td>
            <button class="btn btn-ghost btn-sm" data-edit="${App.Utils.escHtml(s._id)}"
              data-username="${App.Utils.escHtml(s.userName)}"
              data-email="${App.Utils.escHtml(s.email || '')}"
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
          _id:      btn.dataset.edit,
          userName: btn.dataset.username,
          email:    btn.dataset.email,
          isActive: btn.dataset.active === 'true',
        }));
      });

      tbody.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => this._openDeleteModal(btn.dataset.delete, btn.dataset.name));
      });
    }).catch(err => {
      tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load supervisors.', 4);
      App.Utils.toast(err.message || 'Error loading supervisors.', 'error');
    });
  },

  _openCreate() {
    this._editingId = null;
    document.getElementById('supModalTitle').innerHTML = '<i class="fas fa-user-tie"></i> New Supervisor';
    document.getElementById('mSupPasswordLabel').innerHTML = 'Password <span class="required">*</span>';
    document.getElementById('mSupUserName').value = '';
    document.getElementById('mSupPassword').value = '';
    document.getElementById('mSupEmail').value    = '';
    document.getElementById('mSupActive').value   = 'true';
    document.getElementById('supervisorModal').classList.add('active');
  },

  _openEdit(sup) {
    this._editingId = sup._id;
    document.getElementById('supModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Supervisor';
    document.getElementById('mSupPasswordLabel').innerHTML = 'New Password <small style="color:var(--clr-warm-500); font-weight:400">(leave blank to keep)</small>';
    document.getElementById('mSupUserName').value = sup.userName || '';
    document.getElementById('mSupPassword').value = '';
    document.getElementById('mSupEmail').value    = sup.email    || '';
    document.getElementById('mSupActive').value   = sup.isActive ? 'true' : 'false';
    document.getElementById('supervisorModal').classList.add('active');
  },

  _openDeleteModal(id, name) {
    this._deletingId   = id;
    this._deletingName = name;
    document.getElementById('deleteSupNameLabel').textContent = name;
    document.getElementById('deleteSupModal').classList.add('active');
  },

  _closeModal() {
    document.getElementById('supervisorModal').classList.remove('active');
  },

  _submit() {
    const isEdit   = !!this._editingId;
    const userName = document.getElementById('mSupUserName').value.trim();
    const password = document.getElementById('mSupPassword').value.trim();
    const email    = document.getElementById('mSupEmail').value.trim();
    const isActive = document.getElementById('mSupActive').value === 'true';

    if (!userName) {
      App.Utils.toast('Username is required.', 'error');
      return;
    }
    if (!isEdit && !password) {
      App.Utils.toast('Password is required for new supervisors.', 'error');
      return;
    }

    const payload = { userName, email, isActive };
    if (password) payload.password = password;

    const confirmBtn = document.getElementById('confirmSupBtn');
    confirmBtn.disabled = true;

    const action = isEdit
      ? App.Api.updateSupervisor(this._editingId, payload)
      : App.Api.createSupervisor(payload);

    action.then(() => {
      this._closeModal();
      this._load();
      App.Utils.toast(`Supervisor ${isEdit ? 'updated' : 'added'} successfully.`);
    }).catch(err => {
      App.Utils.toast(err.message || 'Operation failed.', 'error');
    }).finally(() => { confirmBtn.disabled = false; });
  },

  _confirmDelete() {
    const confirmBtn = document.getElementById('confirmDeleteSupBtn');
    confirmBtn.disabled = true;

    App.Api.deleteSupervisor(this._deletingId).then(() => {
      document.getElementById('deleteSupModal').classList.remove('active');
      this._load();
      App.Utils.toast(`Supervisor "${this._deletingName}" deleted.`);
    }).catch(err => {
      App.Utils.toast(err.message || 'Delete failed.', 'error');
    }).finally(() => { confirmBtn.disabled = false; });
  },
};


App.Pages.Supervisors = {
  render() {
    return `
      <div class="page-card">
        <div class="page-card-header">
          <h2><i class="fas fa-user-tie"></i> Supervisors (Superviseurs)</h2>
          <button class="btn btn-gradient btn-sm" id="openSupModalBtn">
            <i class="fas fa-plus-circle"></i> New Supervisor
          </button>
        </div>
        <hr class="divider">

        <div class="filter-card">
          <div class="filter-title"><i class="fas fa-filter"></i> Search Supervisor</div>
          <div class="filter-grid">
            <div class="filter-field">
              <label>Name</label>
              <input type="text" id="supSearchInput" placeholder="Search by name...">
            </div>
            <div>
              <button class="btn btn-gradient btn-sm" id="searchSupBtn">
                <i class="fas fa-search"></i> Search
              </button>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Commission (%)</th>
                <th>Region</th>
              </tr>
            </thead>
            <tbody id="supTableBody">
              ${App.Utils.tableLoadingRow(5)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Supervisor Modal -->
      <div id="supervisorModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3><i class="fas fa-user-tie"></i> New Supervisor</h3>
            <button class="modal-close" id="closeSupModalBtn" aria-label="Close"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-grid">
            <div class="form-group"><label>Full Name *</label><input type="text" id="mSupName" placeholder="Supervisor name"></div>
            <div class="form-group"><label>Email / Contact</label><input type="text" id="mSupContact" placeholder="Email or phone"></div>
            <div class="form-group"><label>Commission (%) *</label><input type="number" step="0.5" id="mSupCommission" placeholder="e.g. 5"></div>
            <div class="form-group"><label>Region</label><input type="text" id="mSupRegion" placeholder="Region"></div>
          </div>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelSupModalBtn">Cancel</button>
            <button class="btn btn-primary" id="confirmAddSupBtn"><i class="fas fa-save"></i> Add Supervisor</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this._load();

    document.getElementById('searchSupBtn').addEventListener('click', () => this._load());
    document.getElementById('supSearchInput').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this._load();
    });

    document.getElementById('openSupModalBtn').addEventListener('click', () => {
      this._clearModal();
      document.getElementById('supervisorModal').classList.add('active');
    });
    document.getElementById('closeSupModalBtn').addEventListener('click',  () => this._closeModal());
    document.getElementById('cancelSupModalBtn').addEventListener('click', () => this._closeModal());
    document.getElementById('supervisorModal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this._closeModal();
    });
    document.getElementById('confirmAddSupBtn').addEventListener('click', () => this._submit());
  },

  _load() {
    const search = document.getElementById('supSearchInput')?.value.trim() || '';
    const tbody  = document.getElementById('supTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(5);

    App.Api.getSupervisors(search).then(sups => {
      if (!sups.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No supervisors found.', 5);
        return;
      }
      tbody.innerHTML = sups.map(s => `
        <tr>
          <td>${App.Utils.escHtml(s.id)}</td>
          <td><strong>${App.Utils.escHtml(s.name)}</strong></td>
          <td>${App.Utils.escHtml(s.contact || '—')}</td>
          <td>${App.Utils.formatPercent(s.commission)}</td>
          <td>${App.Utils.escHtml(s.region || '—')}</td>
        </tr>
      `).join('');
    });
  },

  _closeModal() {
    document.getElementById('supervisorModal').classList.remove('active');
  },

  _clearModal() {
    ['mSupName','mSupContact','mSupCommission','mSupRegion'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  },

  _submit() {
    const name       = document.getElementById('mSupName').value.trim();
    const contact    = document.getElementById('mSupContact').value.trim();
    const commission = parseFloat(document.getElementById('mSupCommission').value);
    const region     = document.getElementById('mSupRegion').value.trim();

    if (!name || isNaN(commission)) {
      App.Utils.toast('Name and Commission are required.', 'error');
      return;
    }

    const confirmBtn = document.getElementById('confirmAddSupBtn');
    confirmBtn.disabled = true;

    App.Api.createSupervisor({ name, contact, commission, region }).then(sup => {
      this._closeModal();
      this._load();
      App.Utils.toast(`Supervisor "${sup.name}" added successfully.`);
    }).finally(() => { confirmBtn.disabled = false; });
  },
};
