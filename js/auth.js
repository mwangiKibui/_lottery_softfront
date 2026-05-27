/* =====================================================================
   PRINCE LOTO — Authentication
   Manages login state, session storage, and guards.

   INTEGRATION NOTE:
   When USE_DUMMY_DATA = false, login() calls the real API endpoint.
   The server must return { token, user: { id, name, role } }.
   ===================================================================== */

window.App = window.App || {};

App.Auth = {
  /* ── Check session ── */
  isLoggedIn() {
    return !!localStorage.getItem(App.Config.SESSION_TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(App.Config.SESSION_USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },

  getToken() {
    return localStorage.getItem(App.Config.SESSION_TOKEN_KEY);
  },

  /* ── Login ──────────────────────────────────────────────────────────
     API INTEGRATION POINT: POST /auth/login
     Body:    { username, password }
     Returns: { token: string, user: { id, name, role, email } }

     On success: store token + user in localStorage, redirect to dashboard.
     On failure: return { success: false, error: '...' }
  ────────────────────────────────────────────────────────────────── */
  async login(usernameOrEmail, password) {
    if (App.Config.USE_DUMMY_DATA) {
      const match = App.Config.DUMMY_CREDENTIALS.find(
        u => (u.username === usernameOrEmail || (u.email && u.email === usernameOrEmail))
             && u.password === password
      );
      if (!match) {
        return { success: false, error: 'Invalid username or password.' };
      }
      const { password: _, ...safeUser } = match;
      const token = `dummy_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(App.Config.SESSION_TOKEN_KEY, token);
      localStorage.setItem(App.Config.SESSION_USER_KEY, JSON.stringify(safeUser));
      return { success: true, user: safeUser };
    }

    /* Real API call */
    try {
      const res = await fetch(`${App.Config.API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ userName: usernameOrEmail, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { success: false, error: data.message || 'Login failed. Please try again.' };
      }

      // The API returns HTTP 200 even for auth failures — always check data.success
      if (!data.success) {
        return { success: false, error: data.message || 'Invalid credentials. Please try again.' };
      }

      if (!data.token || !data.user) {
        return { success: false, error: 'Unexpected server response.' };
      }

      // Normalise to the shape the rest of the app expects
      const user = {
        id:          data.user._id,
        name:        data.user.userName,
        role:        data.user.role,
        email:       data.user.email       || '',
        companyName: data.user.companyName || '',
        companyLogo: data.user.companyLogo || '',
        address:     data.user.address     || '',
        phoneNumber: data.user.phoneNumber || '',
        bonusFlag:   data.user.bonusFlag   || false,
      };

      localStorage.setItem(App.Config.SESSION_TOKEN_KEY, data.token);
      localStorage.setItem(App.Config.SESSION_USER_KEY, JSON.stringify(user));
      return { success: true, user };
    } catch (err) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  /* ── Logout ── */
  logout() {
    // Notify the server to clear the session cookie (fire-and-forget)
    const token = this.getToken();
    if (token && !App.Config.USE_DUMMY_DATA) {
      fetch(`${App.Config.API_BASE_URL}/auth/signout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(App.Config.SESSION_TOKEN_KEY);
    localStorage.removeItem(App.Config.SESSION_USER_KEY);
    window.location.href = 'login.html';
  },

  /* ── Route guard — call at top of dashboard.html ── */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  /* ── Redirect if already logged in (for login page) ── */
  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      window.location.href = 'dashboard.html';
    }
  },
};
