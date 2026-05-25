/* =====================================================================
   PRINCE LOTO — Supervisors Page
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

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
