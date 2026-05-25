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
      const res = await fetch(`${App.Config.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ username: usernameOrEmail, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { success: false, error: data.message || 'Login failed. Please try again.' };
      }

      if (!data.token || !data.user) {
        return { success: false, error: 'Unexpected server response.' };
      }

      localStorage.setItem(App.Config.SESSION_TOKEN_KEY, data.token);
      localStorage.setItem(App.Config.SESSION_USER_KEY, JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  },

  /* ── Logout ── */
  logout() {
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
