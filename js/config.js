/* =====================================================================
   PRINCE LOTO — Application Configuration
   ─────────────────────────────────────────────────────────────────────
   ENVIRONMENT DETECTION
   The API URL is chosen automatically based on hostname:
     • localhost / 127.0.0.1 / file:// → LOCAL_API_URL
     • any other host                  → PROD_API_URL

   To connect the real backend:
     1. Set USE_DUMMY_DATA = false
     2. Update PROD_API_URL to the deployed backend root
   ===================================================================== */

window.App = window.App || {};

(function () {
  /* ── Environment URLs ───────────────────────────────────────────────
     Update PROD_API_URL before deploying.
  ────────────────────────────────────────────────────────────────── */
  var LOCAL_API_URL = 'http://localhost:8080/api';
  var PROD_API_URL  = 'https://lottery-softback.onrender.com/api'; // TODO: confirm production endpoint

  var _localHosts = ['localhost', '127.0.0.1', ''];
  var _isLocal    = _localHosts.indexOf(window.location.hostname) !== -1;

  App.Config = {
    /* Resolved automatically — no manual change needed between environments */
    API_BASE_URL: _isLocal ? LOCAL_API_URL : PROD_API_URL,

    /* Expose which environment is active (read-only, useful for debugging) */
    ENV: _isLocal ? 'local' : 'production',

    /* ── Feature Flags ─────────────────────────────────────────────────
       Set USE_DUMMY_DATA = false once the API is connected.
       All Api.* methods will automatically switch to live calls.
    ────────────────────────────────────────────────────────────────── */
    USE_DUMMY_DATA: true,

    /* ── Auth ──────────────────────────────────────────────────────────
       Dummy credentials for local development.
       Ignored when USE_DUMMY_DATA = false (API handles auth).
    ────────────────────────────────────────────────────────────────── */
    DUMMY_CREDENTIALS: [
      { username: 'LuckyMan', password: 'happy0831', role: 'admin',   name: 'Administrator' },
      { username: 'Ken',      password: 'Test1234!', role: 'manager', name: 'Branch Manager' }
    ],

    /* ── Session ───────────────────────────────────────────────────── */
    SESSION_TOKEN_KEY: 'pl_session_token',
    SESSION_USER_KEY:  'pl_session_user',

    /* ── Simulated API Delay (ms) ──────────────────────────────────── */
    DUMMY_DELAY: 200,
  };
}());
