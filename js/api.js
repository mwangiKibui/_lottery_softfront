/* =====================================================================
   PRINCE LOTO — API Layer
   All data access goes through this module. When USE_DUMMY_DATA = true,
   methods return resolved promises from App.Data. When false, they call
   the real REST API at App.Config.API_BASE_URL.

   INTEGRATION GUIDE:
   1. Set App.Config.USE_DUMMY_DATA = false in config.js
   2. Set App.Config.API_BASE_URL to your backend URL
   3. Each method below has a comment showing the exact endpoint to call
   4. The response shape expected is documented per method
   ===================================================================== */

window.App = window.App || {};

/* Extracts a human-readable message from various backend error shapes:
   - Plain { message } objects
   - Mongoose ValidationError { errors: { field: { message } } }
   - MongoDB duplicate-key error { code: 11000, keyValue: { field } }
   - Plain JS Error serialised as {} (message is non-enumerable) */
function _extractErrorMessage(data, status) {
  if (!data) return `Request failed (HTTP ${status})`;

  // Plain message string
  if (data.message) return data.message;

  // Mongoose ValidationError — collect per-field messages
  if (data.errors && typeof data.errors === 'object') {
    const msgs = Object.values(data.errors)
      .map(e => e.message || e.msg)
      .filter(Boolean);
    if (msgs.length) return msgs.join(' | ');
  }

  // MongoDB duplicate key (code 11000)
  if (data.code === 11000 || data.code === '11000') {
    const field = Object.keys(data.keyValue || {})[0];
    return field
      ? `"${data.keyValue[field]}" is already taken (${field}).`
      : 'A duplicate entry already exists.';
  }

  return `Request failed (HTTP ${status})`;
}

App.Api = {
  /* ────────────────────────────────────────────
     INTERNAL: HTTP helpers
  ──────────────────────────────────────────── */
  _token() {
    return localStorage.getItem(App.Config.SESSION_TOKEN_KEY);
  },

  async _request(method, path, body = null) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    const token = this._token();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${App.Config.API_BASE_URL}${path}`, options);

    if (res.status === 401) {
      App.Auth.logout();
      return;
    }
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(_extractErrorMessage(errData, res.status));
    }
    return res.json();
  },

  _get(path)           { return this._request('GET', path); },
  _post(path, body)    { return this._request('POST', path, body); },
  _put(path, body)     { return this._request('PUT', path, body); },
  _patch(path, body)   { return this._request('PATCH', path, body); },
  _delete(path)        { return this._request('DELETE', path); },

  /* For multipart/form-data (file uploads) */
  async _multipart(method, path, formData) {
    const headers = {};
    const token = this._token();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${App.Config.API_BASE_URL}${path}`, {
      method,
      headers,
      body: formData,
    });
    if (res.status === 401) { App.Auth.logout(); return; }
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(_extractErrorMessage(errData, res.status));
    }
    return res.json();
  },

  _dummy(data) {
    return App.Utils.delay(App.Config.DUMMY_DELAY).then(() => data);
  },

  /* ────────────────────────────────────────────
     AUTH
     API INTEGRATION POINT: POST /auth/login
     Body:    { username, password }
     Returns: { token: string, user: { id, name, role, email } }
  ──────────────────────────────────────────── */
  // Auth is handled in App.Auth — see auth.js

  /* ────────────────────────────────────────────
     DASHBOARD
     For admin: fetches counts of sub-admins, game & lottery categories.
     For subAdmin: re-uses existing stats shape from dummy data (no dedicated endpoint).
  ──────────────────────────────────────────── */
  getDashboardStats() {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ ...App.Data.dashboardStats });
    const user = App.Auth.getUser();
    if (user && user.role === 'admin') {
      return Promise.all([
        this._get('/admin/getsubadmin').catch(() => []),
        this._get('/admin/getgamecategory').catch(() => []),
        this._get('/admin/getlotterycategory').catch(() => ({ data: [] })),
      ]).then(([subAdmins, gameCategories, lotteryCatResp]) => {
        const subAdminCount   = Array.isArray(subAdmins) ? subAdmins.length : 0;
        const gameCatCount    = Array.isArray(gameCategories) ? gameCategories.length : 0;
        const lotteryCats     = lotteryCatResp && Array.isArray(lotteryCatResp.data) ? lotteryCatResp.data : [];
        const lotteryCatCount = lotteryCats.length;
        return { subAdminCount, gameCatCount, lotteryCatCount };
      });
    }
    // subAdmin: pull today’s reports + seller/supervisor counts
    const today = new Date().toISOString().split('T')[0];
    return Promise.all([
      this._get('/subadmin/getseller').catch(() => ({ users: [] })),
      this._get('/subadmin/getsuperVisor').catch(() => []),
      this._get(`/subadmin/getsalereports?fromDate=${today}&toDate=${today}&lotteryCategoryName=&seller=`).catch(() => ({ data: {} })),
    ]).then(([sellerResp, supResp, reportResp]) => {
      const sellerCount = Array.isArray(sellerResp.users) ? sellerResp.users.length : 0;
      const supCount    = Array.isArray(supResp) ? supResp.length : 0;
      const data        = (reportResp && reportResp.data) ? reportResp.data : {};
      let   totalSell   = 0;
      let   paidAmount  = 0;
      Object.values(data).forEach(s => { totalSell += s.sum || 0; paidAmount += s.paid || 0; });
      return { totalSell, paidAmount, profit: totalSell - paidAmount, sellerCount, supCount };
    });
  },

  getLatestDraws() {
    if (App.Config.USE_DUMMY_DATA) return this._dummy([...App.Data.drawNumbers].slice(0, 3));
    const user     = App.Auth.getUser();
    const endpoint = (user && user.role === 'admin') ? '/admin/getwiningnumber' : '/subadmin/getwiningnumber';
    // Send a 90-day window so the backend date filter always returns recent draws
    const toDate   = new Date().toISOString().slice(0, 10);
    const fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return this._post(endpoint, { lotteryCategoryName: '', fromDate, toDate })
      .then(resp => {
        const rows = (resp && resp.data) ? resp.data : [];
        // Sort descending by date and take the 5 most recent
        return rows
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map(w => ({
            _id:     w._id,
            lottery: w.lotteryCategoryName || w.lotteryName,
            date:    w.date,
            numbers: w.numbers || [],
          }));
      })
      .catch(() => []);
  },

  /* ────────────────────────────────────────────
     ADMIN — GAME CATEGORIES
     GET    /admin/getgamecategory
     POST   /admin/addgamecategory          { gameName, positions, requiredLength }
     PATCH  /admin/updategamecategory/:id
     DELETE /admin/deletegamecategory/:id
  ──────────────────────────────────────────── */
  getGameCategories() {
    if (App.Config.USE_DUMMY_DATA) return this._dummy(App.Data.gameCategories || []);
    return this._get('/admin/getgamecategory');
  },

  createGameCategory(payload) {
    if (App.Config.USE_DUMMY_DATA) {
      const cat = { ...payload, _id: 'gc_' + Date.now() };
      (App.Data.gameCategories = App.Data.gameCategories || []).push(cat);
      return this._dummy(cat);
    }
    return this._post('/admin/addgamecategory', payload);
  },

  updateGameCategory(id, payload) {
    if (App.Config.USE_DUMMY_DATA) {
      const cats = App.Data.gameCategories || [];
      const idx = cats.findIndex(c => c._id === id);
      if (idx > -1) cats[idx] = { ...cats[idx], ...payload };
      return this._dummy(cats[idx]);
    }
    return this._patch(`/admin/updategamecategory/${id}`, payload);
  },

  deleteGameCategory(id) {
    if (App.Config.USE_DUMMY_DATA) {
      App.Data.gameCategories = (App.Data.gameCategories || []).filter(c => c._id !== id);
      return this._dummy({ message: 'Game category deleted' });
    }
    return this._delete(`/admin/deletegamecategory/${id}`);
  },

  /* ────────────────────────────────────────────
     ADMIN — LOTTERY CATEGORIES
     GET    /admin/getlotterycategory        → { success, data: [...] }
     POST   /admin/addlotterycategory        { lotteryName, startTime, endTime }
     PATCH  /admin/updatelotterycategory/:id
     DELETE /admin/deletelotterycategory/:id
  ──────────────────────────────────────────── */
  getLotteryCategories() {
    if (App.Config.USE_DUMMY_DATA) return this._dummy(App.Data.lotteries.map((l, i) => ({ _id: 'lc_' + i, lotteryName: l })));
    return this._get('/admin/getlotterycategory').then(resp => (resp && resp.data) ? resp.data : []);
  },

  createLotteryCategory(payload) {
    if (App.Config.USE_DUMMY_DATA) {
      const cat = { ...payload, _id: 'lc_' + Date.now() };
      return this._dummy(cat);
    }
    return this._post('/admin/addlotterycategory', payload);
  },

  updateLotteryCategory(id, payload) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ ...payload, _id: id });
    return this._patch(`/admin/updatelotterycategory/${id}`, payload);
  },

  deleteLotteryCategory(id) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ message: 'Category deleted' });
    return this._delete(`/admin/deletelotterycategory/${id}`);
  },

  /* ────────────────────────────────────────────
     ADMIN — SUB-ADMIN MANAGEMENT
     GET    /admin/getsubadmin
     GET    /admin/getdeletedsubadmin
     POST   /admin/addsubadmin              multipart/form-data
     PATCH  /admin/updatesubadmin/:id       multipart/form-data
     PATCH  /admin/restoresubadmin/:id
     DELETE /admin/deletesubadmin/:id
  ──────────────────────────────────────────── */
  getSubAdmins() {
    if (App.Config.USE_DUMMY_DATA) return this._dummy(App.Data.subAdmins || []);
    return this._get('/admin/getsubadmin');
  },

  getDeletedSubAdmins() {
    if (App.Config.USE_DUMMY_DATA) return this._dummy([]);
    return this._get('/admin/getdeletedsubadmin');
  },

  createSubAdmin(formData) {
    if (App.Config.USE_DUMMY_DATA) {
      const sa = { _id: 'sa_' + Date.now(), userName: formData.get('userName'), companyName: formData.get('companyName'), role: 'subAdmin', isActive: true };
      (App.Data.subAdmins = App.Data.subAdmins || []).push(sa);
      return this._dummy(sa);
    }
    return this._multipart('POST', '/admin/addsubadmin', formData);
  },

  updateSubAdmin(id, formData) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ _id: id });
    return this._multipart('PATCH', `/admin/updatesubadmin/${id}`, formData);
  },

  deleteSubAdmin(id) {
    if (App.Config.USE_DUMMY_DATA) {
      App.Data.subAdmins = (App.Data.subAdmins || []).filter(s => s._id !== id);
      return this._dummy({ message: 'Sub-admin deleted' });
    }
    return this._delete(`/admin/deletesubadmin/${id}`);
  },

  restoreSubAdmin(id) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ _id: id });
    return this._patch(`/admin/restoresubadmin/${id}`, {});
  },

  /* ────────────────────────────────────────────
     ADMIN — WINNING NUMBERS
     POST   /admin/addwiningnumber          { lotteryCategoryName, date, numbers: [{gameCategory, number, position}] }
     POST   /admin/getwiningnumber          { lotteryCategoryName, fromDate, toDate }   → { success, data }
     GET    /admin/getwiningnumber/:date    single by date
     PATCH  /admin/updatewiningnumber/:id
     DELETE /admin/deletewiningnumber/:id
  ──────────────────────────────────────────── */
  getWinningNumbers(filters = {}) {
    if (App.Config.USE_DUMMY_DATA) {
      let data = [...App.Data.drawNumbers];
      if (filters.lottery)  data = data.filter(d => d.lottery === filters.lottery);
      if (filters.fromDate) data = data.filter(d => d.date >= filters.fromDate);
      if (filters.toDate)   data = data.filter(d => d.date <= filters.toDate);
      return this._dummy(data);
    }
    const user     = App.Auth.getUser();
    const endpoint = (user && user.role === 'admin') ? '/admin/getwiningnumber' : '/subadmin/getwiningnumber';
    return this._post(endpoint, {
      lotteryCategoryName: filters.lottery   || '',
      fromDate:            filters.fromDate  || '',
      toDate:              filters.toDate    || '',
    }).then(resp => (resp && resp.data) ? resp.data : []);
  },

  addWinningNumber(payload) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ ...payload, _id: 'wn_' + Date.now() });
    return this._post('/admin/addwiningnumber', payload);
  },

  updateWinningNumber(id, payload) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ ...payload, _id: id });
    return this._patch(`/admin/updatewiningnumber/${id}`, payload);
  },

  deleteWinningNumber(id) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ message: 'Winning number deleted successfully!' });
    return this._delete(`/admin/deletewiningnumber/${id}`);
  },

  /* ────────────────────────────────────────────
     SUB-ADMIN — SELLERS
     GET    /subadmin/getseller              → { sucess, users, companyName, bonusFlag }
     POST   /subadmin/addseller             { userName, password, imei, email, isActive, superVisorName }
     PATCH  /subadmin/updateseller/:id
     PATCH  /subadmin/updateBonusFlag       { bonusFlag }
     DELETE /subadmin/deleteseller/:id
  ──────────────────────────────────────────── */
  getSellers() {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ users: [...App.Data.sellers], companyName: '', bonusFlag: false });
    return this._get('/subadmin/getseller')
      .then(resp => ({
        users:       Array.isArray(resp.users) ? resp.users : [],
        companyName: resp.companyName || '',
        bonusFlag:   !!resp.bonusFlag,
      }));
  },

  createSeller(payload) {
    if (App.Config.USE_DUMMY_DATA) {
      const seller = { ...payload, _id: 'sel_' + Date.now(), role: 'seller' };
      return this._dummy(seller);
    }
    return this._post('/subadmin/addseller', payload);
  },

  updateSeller(id, payload) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ _id: id });
    return this._patch(`/subadmin/updateseller/${id}`, payload);
  },

  deleteSeller(id) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ success: true });
    return this._delete(`/subadmin/deleteseller/${id}`);
  },

  updateBonusFlag(bonusFlag) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ success: true });
    return this._patch('/subadmin/updateBonusFlag', { bonusFlag });
  },

  /* ────────────────────────────────────────────
     SUB-ADMIN — SUPERVISORS
     GET    /subadmin/getsuperVisor
     POST   /subadmin/addsuperVisor         { userName, password, email, isActive }
     PATCH  /subadmin/updatesuperVisor/:id
     DELETE /subadmin/deletesuperVisor/:id
  ──────────────────────────────────────────── */
  getSupervisors() {
    if (App.Config.USE_DUMMY_DATA) return this._dummy([...App.Data.supervisors]);
    return this._get('/subadmin/getsuperVisor')
      .then(resp => Array.isArray(resp) ? resp : (resp.users || []));
  },

  createSupervisor(payload) {
    if (App.Config.USE_DUMMY_DATA) {
      const sup = { ...payload, _id: 'sup_' + Date.now(), role: 'superVisor' };
      return this._dummy(sup);
    }
    return this._post('/subadmin/addsuperVisor', payload);
  },

  updateSupervisor(id, payload) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ _id: id });
    return this._patch(`/subadmin/updatesuperVisor/${id}`, payload);
  },

  deleteSupervisor(id) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ success: true });
    return this._delete(`/subadmin/deletesuperVisor/${id}`);
  },

  /* ────────────────────────────────────────────
     SUB-ADMIN — SALES REPORTS
     GET /subadmin/getsalereports
       ?fromDate=&toDate=&lotteryCategoryName=comma-separated&seller=id&supervisor=id
     → { success, data: { sellerName: { name, sum, paid } } }
  ──────────────────────────────────────────── */
  getSalesReport(filters = {}) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({});
    const q = new URLSearchParams({
      fromDate:            filters.fromDate    || '',
      toDate:              filters.toDate      || '',
      lotteryCategoryName: filters.lotteries   || '',  // comma-separated lottery names
      seller:              filters.seller      || '',
      supervisor:          filters.supervisor  || '',
    }).toString();
    return this._get(`/subadmin/getsalereports?${q}`)
      .then(resp => (resp && resp.data) ? resp.data : {});
  },

  /* ────────────────────────────────────────────
     SUB-ADMIN — PAYMENT TERMS
     GET    /subadmin/getpaymentterm?scope=all|seller|supervisor&seller=id&supervisor=id
     POST   /subadmin/addpaymentterm  { lotteryCategoryName, conditions, seller?, superVisor? }
     PATCH  /subadmin/updatepaymentterm/:id  { conditions }  (backend creates new version)
     DELETE /subadmin/deletepaymentterm/:id
  ──────────────────────────────────────────── */
  getPaymentTerms(scope = 'all', entity = '') {
    if (App.Config.USE_DUMMY_DATA) return this._dummy([]);
    const params = new URLSearchParams({ scope });
    if (scope === 'seller'     && entity) params.set('seller',     entity);
    if (scope === 'supervisor' && entity) params.set('supervisor', entity);
    return this._get(`/subadmin/getpaymentterm?${params.toString()}`)
      .then(resp => Array.isArray(resp) ? resp : []);
  },

  addPaymentTerm(payload) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ ...payload, _id: 'pt_' + Date.now() });
    return this._post('/subadmin/addpaymentterm', payload);
  },

  updatePaymentTerm(id, payload) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ _id: id });
    return this._patch(`/subadmin/updatepaymentterm/${id}`, payload);
  },

  deletePaymentTerm(id) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ success: true });
    return this._delete(`/subadmin/deletepaymentterm/${id}`);
  },

  /* ────────────────────────────────────────────
     SUB-ADMIN — SOLD TICKETS
     GET /subadmin/gettickets?fromDate=&toDate=&lotteryCategoryName=&seller=
     → { success, data: [{ _id, ticketId, seller, lotteryCategoryName, date, isDelete, numbers }] }
  ──────────────────────────────────────────── */
  getSoldTickets(filters = {}) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy([]);
    const q = new URLSearchParams({
      fromDate:            filters.fromDate || '',
      toDate:              filters.toDate   || '',
      lotteryCategoryName: filters.lottery  || '',
      seller:              filters.seller   || '',
    }).toString();
    return this._get(`/subadmin/gettickets?${q}`)
      .then(resp => (resp && resp.data) ? resp.data : []);
  },

  deleteTicket(id) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ success: true });
    return this._delete(`/subadmin/deleteticket/${id}`);
  },

  /* ────────────────────────────────────────────
     SUB-ADMIN — WINNING TICKETS
     GET /subadmin/getwintickets?fromDate=&toDate=&lotteryCategoryName=&seller=
  ──────────────────────────────────────────── */
  getWinningTickets(filters = {}) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy([]);
    const q = new URLSearchParams({
      fromDate:            filters.fromDate || '',
      toDate:              filters.toDate   || '',
      lotteryCategoryName: filters.lottery  || '',
      seller:              filters.seller   || '',
    }).toString();
    return this._get(`/subadmin/getwintickets?${q}`)
      .then(resp => (resp && resp.data) ? resp.data : []);
  },

  /* ────────────────────────────────────────────
     SUB-ADMIN — AMOUNT LIMITS
     POST   /subadmin/addlimitbut           { lotteryCategoryName, limits:[{gameCategory,gameNumber,limitsButs}], seller?, superVisor? }
     GET    /subadmin/getlimitbutAll
     GET    /subadmin/getlimitbutSeller?seller=&lotteryCategoryName=
     GET    /subadmin/getlimitbutSuperVisor?superVisor=&lotteryCategoryName=
     PATCH  /subadmin/updatelimitbut/:id
     DELETE /subadmin/deletelimitbut/:id
  ──────────────────────────────────────────── */
  getLimits(context = 'all', entity = null, lottery = '') {
    if (App.Config.USE_DUMMY_DATA) return this._dummy([]);
    if (context === 'seller' && entity) {
      const q = new URLSearchParams({ seller: entity, lotteryCategoryName: lottery }).toString();
      return this._get(`/subadmin/getlimitbutSeller?${q}`)
        .then(resp => Array.isArray(resp) ? resp : (resp.data || []));
    }
    if (context === 'supervisor' && entity) {
      const q = new URLSearchParams({ superVisor: entity, lotteryCategoryName: lottery }).toString();
      return this._get(`/subadmin/getlimitbutSuperVisor?${q}`)
        .then(resp => Array.isArray(resp) ? resp : (resp.data || []));
    }
    return this._get('/subadmin/getlimitbutAll')
      .then(resp => Array.isArray(resp) ? resp : (resp.data || []));
  },

  addLimit(payload) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ success: true });
    return this._post('/subadmin/addlimitbut', payload);
  },

  updateLimit(id, payload) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ _id: id });
    return this._patch(`/subadmin/updatelimitbut/${id}`, payload);
  },

  deleteLimit(id) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ success: true });
    return this._delete(`/subadmin/deletelimitbut/${id}`);
  },

  /* ────────────────────────────────────────────
     SUB-ADMIN — BLOCK NUMBERS
     POST   /subadmin/addblocknumber        { lotteryCategoryName, gameCategory, number }
     GET    /subadmin/getblocknumber
     PATCH  /subadmin/updateblocknumber/:id
     DELETE /subadmin/deleteblocknumber/:id
  ──────────────────────────────────────────── */
  getBlockNumbers() {
    if (App.Config.USE_DUMMY_DATA) return this._dummy([]);
    return this._get('/subadmin/getblocknumber')
      .then(resp => Array.isArray(resp) ? resp : (resp.data || []));
  },

  addBlockNumber(payload) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ ...payload, _id: 'bn_' + Date.now() });
    return this._post('/subadmin/addblocknumber', payload);
  },

  updateBlockNumber(id, payload) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ _id: id });
    return this._patch(`/subadmin/updateblocknumber/${id}`, payload);
  },

  deleteBlockNumber(id) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ success: true });
    return this._delete(`/subadmin/deleteblocknumber/${id}`);
  },

  /* ────────────────────────────────────────────
     DRAW NUMBERS (kept for backward compat)
  ──────────────────────────────────────────── */
  getDrawNumbers(filters = {}) {
    if (App.Config.USE_DUMMY_DATA) {
      let data = [...App.Data.drawNumbers];
      if (filters.lottery)  data = data.filter(d => d.lottery === filters.lottery);
      if (filters.fromDate) data = data.filter(d => d.date >= filters.fromDate);
      if (filters.toDate)   data = data.filter(d => d.date <= filters.toDate);
      return this._dummy(data);
    }
    return this.getWinningNumbers(filters);
  },

  /* ────────────────────────────────────────────
     SUB-ADMIN — PERCENTAGE LIMITS
     GET    /subadmin/getPercentageLimitbButAll          (scope = all)
     GET    /subadmin/getPercentageLimitButSeller        ?seller=&lotteryCategoryName=
     GET    /subadmin/getPercentageLimitButSuperVisor    ?superVisor=&lotteryCategoryName=
     POST   /subadmin/addPercentageLimit   { lotteryCategoryName, limits:[{gameCategory,limitPercent}], seller?, superVisor? }
     PATCH  /subadmin/updatePercentageLimit/:id
     DELETE /subadmin/deletePercentageLimit/:id
  ──────────────────────────────────────────── */
  getPercentageLimits(scope = 'all', entity = '', lottery = '') {
    if (App.Config.USE_DUMMY_DATA) return this._dummy([]);
    if (scope === 'seller') {
      const q = new URLSearchParams({ seller: entity || '', lotteryCategoryName: lottery }).toString();
      return this._get(`/subadmin/getPercentageLimitButSeller?${q}`)
        .then(resp => Array.isArray(resp) ? resp : []);
    }
    if (scope === 'supervisor') {
      const q = new URLSearchParams({ superVisor: entity || '', lotteryCategoryName: lottery }).toString();
      return this._get(`/subadmin/getPercentageLimitButSuperVisor?${q}`)
        .then(resp => Array.isArray(resp) ? resp : []);
    }
    return this._get('/subadmin/getPercentageLimitbButAll')
      .then(resp => Array.isArray(resp) ? resp : []);
  },

  addPercentageLimit(payload) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ ...payload, _id: 'pl_' + Date.now() });
    return this._post('/subadmin/addPercentageLimit', payload);
  },

  updatePercentageLimit(id, payload) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ _id: id });
    return this._patch(`/subadmin/updatePercentageLimit/${id}`, payload);
  },

  deletePercentageLimit(id) {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ success: true });
    return this._delete(`/subadmin/deletePercentageLimit/${id}`);
  },
};
