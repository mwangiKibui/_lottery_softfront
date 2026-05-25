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
      const err = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  },

  _get(path)         { return this._request('GET', path); },
  _post(path, body)  { return this._request('POST', path, body); },
  _put(path, body)   { return this._request('PUT', path, body); },
  _delete(path)      { return this._request('DELETE', path); },

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
     API INTEGRATION POINT: GET /dashboard/stats
     Returns: { totalSell, paidAmount, profit, activeSellers, totalTickets }

     API INTEGRATION POINT: GET /draws/latest
     Returns: [{ drawId, lottery, lot3, sec2, third, date }]
  ──────────────────────────────────────────── */
  getDashboardStats() {
    if (App.Config.USE_DUMMY_DATA) return this._dummy({ ...App.Data.dashboardStats });
    return this._get('/dashboard/stats');
  },

  getLatestDraws() {
    if (App.Config.USE_DUMMY_DATA) return this._dummy([...App.Data.drawNumbers].slice(0, 3));
    return this._get('/draws/latest');
  },

  /* ────────────────────────────────────────────
     SELLERS
     API INTEGRATION POINT: GET  /sellers
     API INTEGRATION POINT: POST /sellers          body: seller object
     API INTEGRATION POINT: PUT  /sellers/:id      body: partial seller
     API INTEGRATION POINT: DELETE /sellers/:id
     Returns list: [{ id, name, deviceId, supervisor, commission, paymentTerm,
                      bonus, profitLimit, logo, companyName, dailyLimit,
                      sellLimit, totalSold, status }]
  ──────────────────────────────────────────── */
  getSellers(search = '') {
    if (App.Config.USE_DUMMY_DATA) {
      let data = [...App.Data.sellers];
      if (search) data = data.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
      return this._dummy(data);
    }
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this._get(`/sellers${q}`);
  },

  createSeller(payload) {
    if (App.Config.USE_DUMMY_DATA) {
      const seller = { ...payload, id: App.Data.nextSellerId(), totalSold: 0, status: 'active' };
      App.Data.sellers.push(seller);
      return this._dummy(seller);
    }
    return this._post('/sellers', payload);
  },

  updateSeller(id, payload) {
    if (App.Config.USE_DUMMY_DATA) {
      const idx = App.Data.sellers.findIndex(s => s.id === id);
      if (idx > -1) App.Data.sellers[idx] = { ...App.Data.sellers[idx], ...payload };
      return this._dummy(App.Data.sellers[idx]);
    }
    return this._put(`/sellers/${id}`, payload);
  },

  deleteSeller(id) {
    if (App.Config.USE_DUMMY_DATA) {
      App.Data.sellers = App.Data.sellers.filter(s => s.id !== id);
      return this._dummy({ success: true });
    }
    return this._delete(`/sellers/${id}`);
  },

  /* ────────────────────────────────────────────
     SUPERVISORS
     API INTEGRATION POINT: GET  /supervisors
     API INTEGRATION POINT: POST /supervisors      body: supervisor object
     Returns list: [{ id, name, contact, commission, region }]
  ──────────────────────────────────────────── */
  getSupervisors(search = '') {
    if (App.Config.USE_DUMMY_DATA) {
      let data = [...App.Data.supervisors];
      if (search) data = data.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
      return this._dummy(data);
    }
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this._get(`/supervisors${q}`);
  },

  createSupervisor(payload) {
    if (App.Config.USE_DUMMY_DATA) {
      const sup = { ...payload, id: App.Data.nextSupervisorId() };
      App.Data.supervisors.push(sup);
      return this._dummy(sup);
    }
    return this._post('/supervisors', payload);
  },

  /* ────────────────────────────────────────────
     SALES REPORTS
     API INTEGRATION POINT: GET /reports/sales
     Query params: seller, supervisor, lottery, fromDate, toDate
     Returns: [{ seller, lottery, date, amount }]
  ──────────────────────────────────────────── */
  getSalesReport(filters = {}) {
    if (App.Config.USE_DUMMY_DATA) {
      let data = [...App.Data.sales];
      if (filters.lottery)    data = data.filter(r => r.lottery === filters.lottery);
      if (filters.fromDate)   data = data.filter(r => r.date >= filters.fromDate);
      if (filters.toDate)     data = data.filter(r => r.date <= filters.toDate);
      if (filters.seller)     data = data.filter(r => r.seller === filters.seller);
      if (filters.supervisor) {
        const names = App.Data.getSellersBySupervisor(filters.supervisor);
        data = data.filter(r => names.includes(r.seller));
      }
      return this._dummy(data);
    }
    return this._get(`/reports/sales?${App.Utils.buildQuery(filters)}`);
  },

  /* ────────────────────────────────────────────
     PAYMENT CONDITIONS
     API INTEGRATION POINT: GET /payment-conditions
     API INTEGRATION POINT: PUT /payment-conditions/:lottery  body: prizeObj
     Returns global: { [lottery]: { '1st': n, '2nd': n, ... '8th': n } }

     API INTEGRATION POINT: GET /payment-conditions/seller/:name/:lottery
     API INTEGRATION POINT: PUT /payment-conditions/seller/:name/:lottery
     API INTEGRATION POINT: GET /payment-conditions/supervisor/:name/:lottery
     API INTEGRATION POINT: PUT /payment-conditions/supervisor/:name/:lottery
  ──────────────────────────────────────────── */
  getPaymentConditions(lottery, context = 'all', entity = null) {
    if (App.Config.USE_DUMMY_DATA) {
      let obj;
      if (context === 'all') {
        obj = { ...App.Data.paymentConditions[lottery] };
      } else if (context === 'seller') {
        const key = `${entity}|${lottery}`;
        if (!App.Data.sellerPaymentOverrides[key])
          App.Data.sellerPaymentOverrides[key] = { ...App.Data.paymentConditions[lottery] };
        obj = { ...App.Data.sellerPaymentOverrides[key] };
      } else if (context === 'supervisor') {
        const key = `${entity}|${lottery}`;
        if (!App.Data.supervisorPaymentOverrides[key])
          App.Data.supervisorPaymentOverrides[key] = { ...App.Data.paymentConditions[lottery] };
        obj = { ...App.Data.supervisorPaymentOverrides[key] };
      }
      return this._dummy(obj);
    }
    if (context === 'all')        return this._get(`/payment-conditions/${encodeURIComponent(lottery)}`);
    if (context === 'seller')     return this._get(`/payment-conditions/seller/${encodeURIComponent(entity)}/${encodeURIComponent(lottery)}`);
    if (context === 'supervisor') return this._get(`/payment-conditions/supervisor/${encodeURIComponent(entity)}/${encodeURIComponent(lottery)}`);
  },

  savePaymentConditions(lottery, prizeObj, context = 'all', entity = null) {
    if (App.Config.USE_DUMMY_DATA) {
      if (context === 'all') {
        App.Data.paymentConditions[lottery] = { ...prizeObj };
      } else if (context === 'seller') {
        App.Data.sellerPaymentOverrides[`${entity}|${lottery}`] = { ...prizeObj };
      } else if (context === 'supervisor') {
        App.Data.supervisorPaymentOverrides[`${entity}|${lottery}`] = { ...prizeObj };
      }
      return this._dummy({ success: true });
    }
    if (context === 'all')        return this._put(`/payment-conditions/${encodeURIComponent(lottery)}`, prizeObj);
    if (context === 'seller')     return this._put(`/payment-conditions/seller/${encodeURIComponent(entity)}/${encodeURIComponent(lottery)}`, prizeObj);
    if (context === 'supervisor') return this._put(`/payment-conditions/supervisor/${encodeURIComponent(entity)}/${encodeURIComponent(lottery)}`, prizeObj);
  },

  /* ────────────────────────────────────────────
     LIMITS
     API INTEGRATION POINT: GET /limits/:lottery
     API INTEGRATION POINT: PUT /limits/:lottery             body: limitObj
     API INTEGRATION POINT: GET /limits/seller/:name/:lottery
     API INTEGRATION POINT: PUT /limits/seller/:name/:lottery
     API INTEGRATION POINT: GET /limits/supervisor/:name/:lottery
     API INTEGRATION POINT: PUT /limits/supervisor/:name/:lottery
  ──────────────────────────────────────────── */
  getLimits(lottery, context = 'all', entity = null) {
    if (App.Config.USE_DUMMY_DATA) {
      let obj;
      if (context === 'all') {
        obj = { ...App.Data.globalLimits[lottery] };
      } else if (context === 'seller') {
        const key = `${entity}|${lottery}`;
        if (!App.Data.sellerLimits[key]) {
          App.Data.sellerLimits[key] = {};
          App.Data.limitCategories.forEach(c => App.Data.sellerLimits[key][c] = 1000);
        }
        obj = { ...App.Data.sellerLimits[key] };
      } else if (context === 'supervisor') {
        const key = `${entity}|${lottery}`;
        if (!App.Data.supervisorLimits[key]) {
          App.Data.supervisorLimits[key] = {};
          App.Data.limitCategories.forEach(c => App.Data.supervisorLimits[key][c] = 1000);
        }
        obj = { ...App.Data.supervisorLimits[key] };
      }
      return this._dummy(obj);
    }
    if (context === 'all')        return this._get(`/limits/${encodeURIComponent(lottery)}`);
    if (context === 'seller')     return this._get(`/limits/seller/${encodeURIComponent(entity)}/${encodeURIComponent(lottery)}`);
    if (context === 'supervisor') return this._get(`/limits/supervisor/${encodeURIComponent(entity)}/${encodeURIComponent(lottery)}`);
  },

  saveLimits(lottery, limitObj, context = 'all', entity = null) {
    if (App.Config.USE_DUMMY_DATA) {
      if (context === 'all') {
        App.Data.globalLimits[lottery] = { ...limitObj };
      } else if (context === 'seller') {
        App.Data.sellerLimits[`${entity}|${lottery}`] = { ...limitObj };
      } else if (context === 'supervisor') {
        App.Data.supervisorLimits[`${entity}|${lottery}`] = { ...limitObj };
      }
      return this._dummy({ success: true });
    }
    if (context === 'all')        return this._put(`/limits/${encodeURIComponent(lottery)}`, limitObj);
    if (context === 'seller')     return this._put(`/limits/seller/${encodeURIComponent(entity)}/${encodeURIComponent(lottery)}`, limitObj);
    if (context === 'supervisor') return this._put(`/limits/supervisor/${encodeURIComponent(entity)}/${encodeURIComponent(lottery)}`, limitObj);
  },

  /* ────────────────────────────────────────────
     SOLD TICKETS
     API INTEGRATION POINT: GET /tickets/sold
     Query params: seller, supervisor, lottery, fromDate, toDate
     Returns: [{ id, lottery, buyer, price, status, seller, date }]
  ──────────────────────────────────────────── */
  getSoldTickets(filters = {}) {
    if (App.Config.USE_DUMMY_DATA) {
      let data = [...App.Data.soldTickets];
      if (filters.lottery)    data = data.filter(t => t.lottery === filters.lottery);
      if (filters.fromDate)   data = data.filter(t => t.date >= filters.fromDate);
      if (filters.toDate)     data = data.filter(t => t.date <= filters.toDate);
      if (filters.seller)     data = data.filter(t => t.seller === filters.seller);
      if (filters.supervisor) {
        const names = App.Data.getSellersBySupervisor(filters.supervisor);
        data = data.filter(t => names.includes(t.seller));
      }
      return this._dummy(data);
    }
    return this._get(`/tickets/sold?${App.Utils.buildQuery(filters)}`);
  },

  /* ────────────────────────────────────────────
     WINNING TICKETS
     API INTEGRATION POINT: GET /tickets/winning
     Query params: seller, supervisor, lottery, fromDate, toDate
     Returns: [{ ticket, lottery, prize, winner, status, seller, date }]
  ──────────────────────────────────────────── */
  getWinningTickets(filters = {}) {
    if (App.Config.USE_DUMMY_DATA) {
      let data = [...App.Data.winningTickets];
      if (filters.lottery)    data = data.filter(w => w.lottery === filters.lottery);
      if (filters.fromDate)   data = data.filter(w => w.date >= filters.fromDate);
      if (filters.toDate)     data = data.filter(w => w.date <= filters.toDate);
      if (filters.seller)     data = data.filter(w => w.seller === filters.seller);
      if (filters.supervisor) {
        const names = App.Data.getSellersBySupervisor(filters.supervisor);
        data = data.filter(w => names.includes(w.seller));
      }
      return this._dummy(data);
    }
    return this._get(`/tickets/winning?${App.Utils.buildQuery(filters)}`);
  },

  /* ────────────────────────────────────────────
     DRAW NUMBERS
     API INTEGRATION POINT: GET /draws
     Query params: lottery, fromDate, toDate
     Returns: [{ drawId, lottery, lot3, sec2, third, date }]
  ──────────────────────────────────────────── */
  getDrawNumbers(filters = {}) {
    if (App.Config.USE_DUMMY_DATA) {
      let data = [...App.Data.drawNumbers];
      if (filters.lottery)  data = data.filter(d => d.lottery === filters.lottery);
      if (filters.fromDate) data = data.filter(d => d.date >= filters.fromDate);
      if (filters.toDate)   data = data.filter(d => d.date <= filters.toDate);
      return this._dummy(data);
    }
    return this._get(`/draws?${App.Utils.buildQuery(filters)}`);
  },
};
