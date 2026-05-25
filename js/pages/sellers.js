/* =====================================================================
   PRINCE LOTO — Sellers Page
   ===================================================================== */

window.App = window.App || {};
App.Pages = App.Pages || {};

App.Pages.Sellers = {
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

        <!-- Filter -->
        <div class="filter-card">
          <div class="filter-title"><i class="fas fa-filter"></i> Search Seller</div>
          <div class="filter-grid">
            <div class="filter-field">
              <label>Seller Name</label>
              <input type="text" id="sellerSearchInput" placeholder="Search by name...">
            </div>
            <div>
              <button class="btn btn-gradient btn-sm" id="searchSellerBtn">
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
                <th>ID</th>
                <th>Seller Name</th>
                <th>Company</th>
                <th>Supervisor</th>
                <th>Commission</th>
                <th>Total Sold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="sellersTableBody">
              ${App.Utils.tableLoadingRow(7)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Seller Modal -->
      <div id="sellerModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3><i class="fas fa-user-plus"></i> New Seller</h3>
            <button class="modal-close" id="closeSellerModalBtn" aria-label="Close"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-grid">
            <div class="form-group"><label>Bank Name *</label><input type="text" id="mSellerName" placeholder="Full name"></div>
            <div class="form-group"><label>App Code / Device *</label><input type="text" id="mSellerDevice" placeholder="Device serial"></div>
            <div class="form-group"><label>Supervisor *</label><input type="text" id="mSellerSupervisor" placeholder="Supervisor name"></div>
            <div class="form-group"><label>Commission (%) *</label><input type="number" step="0.5" id="mSellerCommission" placeholder="e.g. 8"></div>
            <div class="form-group"><label>Payment Term *</label>
              <select id="mSellerPaymentTerm">
                <option>Monthly</option><option>Biweekly</option><option>Weekly</option>
              </select>
            </div>
            <div class="form-group"><label>Bonus ($)</label><input type="number" id="mSellerBonus" placeholder="Bonus amount"></div>
            <div class="form-group"><label>Profit Limit ($)</label><input type="number" id="mSellerProfitLimit" placeholder="Profit cap"></div>
            <div class="form-group"><label>Company Name *</label><input type="text" id="mSellerCompany" placeholder="Company"></div>
          </div>
          <div class="modal-buttons">
            <button class="btn btn-ghost" id="cancelSellerModalBtn">Cancel</button>
            <button class="btn btn-primary" id="confirmAddSellerBtn"><i class="fas fa-save"></i> Add Seller</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this._load();

    document.getElementById('searchSellerBtn').addEventListener('click', () => this._load());
    document.getElementById('sellerSearchInput').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this._load();
    });

    document.getElementById('openSellerModalBtn').addEventListener('click', () => {
      this._clearModal();
      document.getElementById('sellerModal').classList.add('active');
    });
    document.getElementById('closeSellerModalBtn').addEventListener('click',  () => this._closeModal());
    document.getElementById('cancelSellerModalBtn').addEventListener('click', () => this._closeModal());
    document.getElementById('sellerModal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this._closeModal();
    });
    document.getElementById('confirmAddSellerBtn').addEventListener('click', () => this._submit());
  },

  _load() {
    const search = document.getElementById('sellerSearchInput')?.value.trim() || '';
    const tbody  = document.getElementById('sellersTableBody');
    tbody.innerHTML = App.Utils.tableLoadingRow(7);

    App.Api.getSellers(search).then(sellers => {
      if (!sellers.length) {
        tbody.innerHTML = App.Utils.tableEmptyRow('No sellers found.', 7);
        return;
      }
      tbody.innerHTML = sellers.map(s => `
        <tr>
          <td>${App.Utils.escHtml(s.id)}</td>
          <td><strong>${App.Utils.escHtml(s.name)}</strong></td>
          <td>${App.Utils.escHtml(s.companyName)}</td>
          <td>${App.Utils.escHtml(s.supervisor)}</td>
          <td>${App.Utils.formatPercent(s.commission)}</td>
          <td>${App.Utils.formatMoney(s.totalSold)}</td>
          <td>${App.Utils.badge(s.status, s.status === 'active' ? 'success' : 'neutral')}</td>
        </tr>
      `).join('');
    });
  },

  _closeModal() {
    document.getElementById('sellerModal').classList.remove('active');
  },

  _clearModal() {
    ['mSellerName','mSellerDevice','mSellerSupervisor','mSellerCommission',
     'mSellerBonus','mSellerProfitLimit','mSellerCompany'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('mSellerPaymentTerm').value = 'Monthly';
  },

  _submit() {
    const name       = document.getElementById('mSellerName').value.trim();
    const deviceId   = document.getElementById('mSellerDevice').value.trim();
    const supervisor = document.getElementById('mSellerSupervisor').value.trim();
    const commission = parseFloat(document.getElementById('mSellerCommission').value);
    const paymentTerm= document.getElementById('mSellerPaymentTerm').value;
    const bonus      = parseFloat(document.getElementById('mSellerBonus').value) || 0;
    const profitLimit= parseFloat(document.getElementById('mSellerProfitLimit').value) || 0;
    const companyName= document.getElementById('mSellerCompany').value.trim();

    if (!name || !deviceId || !supervisor || isNaN(commission) || !companyName) {
      App.Utils.toast('Please fill all required fields (*).', 'error');
      return;
    }

    const confirmBtn = document.getElementById('confirmAddSellerBtn');
    confirmBtn.disabled = true;

    App.Api.createSeller({ name, deviceId, supervisor, commission, paymentTerm, bonus, profitLimit, companyName }).then(seller => {
      this._closeModal();
      this._load();
      App.Utils.toast(`Seller "${seller.name}" added successfully.`);
    }).finally(() => { confirmBtn.disabled = false; });
  },
};
