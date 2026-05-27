/* =====================================================================
   PRINCE LOTO — Sub-Admin Management Page  (Admin only)
   Create/update/delete company sub-admins.
   API: POST/GET/PATCH/DELETE /api/admin/*subadmin*
   Note: Create & Update use multipart/form-data (supports logo upload).
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.SubAdmins = {
  _editingId:  null,
  _deletingId: null,

  render() {
    return `
      <div class="page-card">
        <div class="page-card-header">
          <h2><i class="fas fa-building"></i> Sub-Admin Management</h2>
          <button class="btn btn-gradient btn-sm" id="openSubAdminModalBtn">
            <i class="fas fa-plus-circle"></i> New Sub-Admin
          </button>
        </div>
        <hr class="divider">

        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Company Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="subAdminTableBody">
              ${App.Utils.tableLoadingRow(6)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <div id="subAdminModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 id="subAdminModalTitle"><i class="fas fa-building"></i> New Sub-Admin</h3>
            <button class="modal-close" id="closeSubAdminModalBtn" aria-label="Close"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-grid">
            <div class="form-group">
              <label>Username <span class="required">*</span></label>
              <input type="text" id="saUserName" placeholder="Unique login name">
            </div>
            <div class="form-group" id="saPasswordGroup">
              <label>Password <span class="required">*</span></label>
              <input type="password" id="saPassword" placeholder="Password">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="saEmail" placeholder="contact@company.com">
            </div>
            <div class="form-group">
              <label>Company Name</label>
              <input type="text" id="saCompanyName" placeholder="Company">
            </div>
            <div class="form-group">
              <label>Address</label>
              <input type="text" id="saAddress" placeholder="City, Country">
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="text" id="saPhoneNumber" placeholder="+509 1234 5678">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select id="saIsActive">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div class="form-group">
              <label>Company Logo</label>
              <input type="file" id="saLogo" accept="image/*">
              <small style="color:var(--text-muted)">Optional. JPEG/PNG recommended.</small>
            </div>
          </div>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelSubAdminModalBtn">Cancel</button>
            <button class="btn btn-primary" id="confirmSubAdminBtn"><i class="fas fa-save"></i> Save</button>
          </div>
        </div>
      </div>

      <!-- Confirm Delete Modal -->
      <div id="subAdminDeleteModal" class="modal-overlay">
        <div class="modal-container" style="max-width:380px">
          <div class="modal-header">
            <h3><i class="fas fa-trash-alt"></i> Delete Sub-Admin</h3>
            <button class="modal-close" id="closeDelSubAdminBtn" aria-label="Close"><i class="fas fa-times"></i></button>
          </div>
          <p style="padding:0 1.5rem 1rem">Are you sure you want to delete <strong id="delSubAdminName"></strong>? All associated data may be affected.</p>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelDelSubAdminBtn">Cancel</button>
            <button class="btn btn-danger" id="confirmDelSubAdminBtn"><i class="fas fa-trash-alt"></i> Delete</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this._editingId  = null;
    this._deletingId = null;
    this._load();

    document.getElementById('openSubAdminModalBtn').addEventListener('click', () => this._openModal());
    document.getElementById('closeSubAdminModalBtn').addEventListener('click', () => this._closeModal());
    document.getElementById('cancelSubAdminModalBtn').addEventListener('click', () => this._closeModal());
    document.getElementById('subAdminModal').addEventListener('click', e => { if (e.target === e.currentTarget) this._closeModal(); });
    document.getElementById('confirmSubAdminBtn').addEventListener('click', () => this._submit());

    document.getElementById('closeDelSubAdminBtn').addEventListener('click', () => this._closeDeleteModal());
    document.getElementById('cancelDelSubAdminBtn').addEventListener('click', () => this._closeDeleteModal());
    document.getElementById('subAdminDeleteModal').addEventListener('click', e => { if (e.target === e.currentTarget) this._closeDeleteModal(); });
    document.getElementById('confirmDelSubAdminBtn').addEventListener('click', () => this._doDelete());
  },

  _load() {
    const tbody = document.getElementById('subAdminTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(6);

    App.Api.getSubAdmins().then(admins => {
      if (!admins || admins.length === 0) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No sub-admins found.', 6);
        return;
      }
      tbody.innerHTML = admins.map(a => `
        <tr>
          <td><strong>${App.Utils.escHtml(a.userName)}</strong></td>
          <td>${App.Utils.escHtml(a.companyName || '—')}</td>
          <td>${App.Utils.escHtml(a.email       || '—')}</td>
          <td>${App.Utils.escHtml(a.phoneNumber  || '—')}</td>
          <td>${App.Utils.badge(a.isActive ? 'active' : 'inactive', a.isActive ? 'success' : 'neutral')}</td>
          <td>
            <button class="btn btn-ghost btn-sm" data-edit="${App.Utils.escHtml(a._id)}"
              data-username="${App.Utils.escHtml(a.userName)}"
              data-email="${App.Utils.escHtml(a.email || '')}"
              data-company="${App.Utils.escHtml(a.companyName || '')}"
              data-address="${App.Utils.escHtml(a.address || '')}"
              data-phone="${App.Utils.escHtml(a.phoneNumber || '')}"
              data-active="${a.isActive ? 'true' : 'false'}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger btn-sm" data-delete="${App.Utils.escHtml(a._id)}" data-name="${App.Utils.escHtml(a.userName)}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', () => this._openModal({
          _id:         btn.dataset.edit,
          userName:    btn.dataset.username,
          email:       btn.dataset.email,
          companyName: btn.dataset.company,
          address:     btn.dataset.address,
          phoneNumber: btn.dataset.phone,
          isActive:    btn.dataset.active === 'true',
        }));
      });
      tbody.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => this._openDeleteModal(btn.dataset.delete, btn.dataset.name));
      });
    }).catch(err => {
      tbody.innerHTML = App.Utils.tableEmptyRow('Failed to load sub-admins.', 6);
      App.Utils.toast(err.message || 'Error loading sub-admins.', 'error');
    });
  },

  _openModal(sa = null) {
    this._editingId = sa ? sa._id : null;
    document.getElementById('subAdminModalTitle').innerHTML = sa
      ? '<i class="fas fa-edit"></i> Edit Sub-Admin'
      : '<i class="fas fa-building"></i> New Sub-Admin';

    // Password field: required only on create
    const pwGroup = document.getElementById('saPasswordGroup');
    const pwLabel = pwGroup.querySelector('label');
    if (sa) {
      pwLabel.innerHTML = 'New Password <small style="color:var(--text-muted)">(leave blank to keep)</small>';
    } else {
      pwLabel.innerHTML = 'Password <span class="required">*</span>';
    }

    document.getElementById('saUserName').value    = sa ? sa.userName    : '';
    document.getElementById('saPassword').value    = '';
    document.getElementById('saEmail').value       = sa ? sa.email       : '';
    document.getElementById('saCompanyName').value = sa ? sa.companyName : '';
    document.getElementById('saAddress').value     = sa ? sa.address     : '';
    document.getElementById('saPhoneNumber').value = sa ? sa.phoneNumber : '';
    document.getElementById('saIsActive').value    = sa ? String(sa.isActive) : 'true';
    document.getElementById('saLogo').value        = '';

    document.getElementById('subAdminModal').classList.add('active');
    document.getElementById('saUserName').focus();
  },

  _closeModal() {
    document.getElementById('subAdminModal').classList.remove('active');
    this._editingId = null;
  },

  _openDeleteModal(id, name) {
    this._deletingId = id;
    document.getElementById('delSubAdminName').textContent = name;
    document.getElementById('subAdminDeleteModal').classList.add('active');
  },

  _closeDeleteModal() {
    document.getElementById('subAdminDeleteModal').classList.remove('active');
    this._deletingId = null;
  },

  _buildFormData() {
    const fd = new FormData();
    const userName    = document.getElementById('saUserName').value.trim();
    const password    = document.getElementById('saPassword').value;
    const email       = document.getElementById('saEmail').value.trim();
    const companyName = document.getElementById('saCompanyName').value.trim();
    const address     = document.getElementById('saAddress').value.trim();
    const phoneNumber = document.getElementById('saPhoneNumber').value.trim();
    const isActive    = document.getElementById('saIsActive').value;
    const logoFile    = document.getElementById('saLogo').files[0];

    if (userName)    fd.append('userName',    userName);
    if (password)    fd.append('password',    password);
    if (email)       fd.append('email',       email);
    if (companyName) fd.append('companyName', companyName);
    if (address)     fd.append('address',     address);
    if (phoneNumber) fd.append('phoneNumber', phoneNumber);
    fd.append('isActive', isActive);
    if (logoFile)    fd.append('companyLogo', logoFile);

    return { fd, userName, password };
  },

  _submit() {
    const { fd, userName, password } = this._buildFormData();

    if (!userName) {
      App.Utils.toast('Username is required.', 'error');
      return;
    }
    if (!this._editingId && !password) {
      App.Utils.toast('Password is required for new sub-admins.', 'error');
      return;
    }

    const btn = document.getElementById('confirmSubAdminBtn');
    btn.disabled = true;

    const action = this._editingId
      ? App.Api.updateSubAdmin(this._editingId, fd)
      : App.Api.createSubAdmin(fd);

    action.then(() => {
      this._closeModal();
      this._load();
      App.Utils.toast(this._editingId ? 'Sub-admin updated.' : `Sub-admin "${userName}" added.`);
    }).catch(err => {
      App.Utils.toast(err.message || 'Failed to save sub-admin.', 'error');
    }).finally(() => { btn.disabled = false; });
  },

  _doDelete() {
    if (!this._deletingId) return;
    const btn = document.getElementById('confirmDelSubAdminBtn');
    btn.disabled = true;

    App.Api.deleteSubAdmin(this._deletingId).then(() => {
      this._closeDeleteModal();
      this._load();
      App.Utils.toast('Sub-admin deleted.');
    }).catch(err => {
      App.Utils.toast(err.message || 'Failed to delete sub-admin.', 'error');
    }).finally(() => { btn.disabled = false; });
  },
};
