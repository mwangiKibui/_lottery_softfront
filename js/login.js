/* =====================================================================
   PRINCE LOTO — Login Page Controller
   ===================================================================== */

(function () {
  // Redirect if already authenticated
  App.Auth.redirectIfLoggedIn();

  const form      = document.getElementById('loginForm');
  const loginBtn  = document.getElementById('loginBtn');
  const errorBox  = document.getElementById('loginError');
  const togglePw  = document.getElementById('togglePassword');
  const pwInput   = document.getElementById('loginPassword');

  /* ── Password visibility toggle ── */
  togglePw.addEventListener('click', () => {
    const show = pwInput.type === 'password';
    pwInput.type = show ? 'text' : 'password';
    togglePw.querySelector('i').className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
  });

  /* ── Show / hide error ── */
  function showError(msg) {
    errorBox.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
    errorBox.removeAttribute('hidden');
  }
  function clearError() {
    errorBox.setAttribute('hidden', '');
    errorBox.textContent = '';
  }

  /* ── Form submit ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const username = document.getElementById('loginUsername').value.trim();
    const password = pwInput.value;

    if (!username || !password) {
      showError('Please enter both username and password.');
      return;
    }

    // Loading state
    loginBtn.disabled = true;
    loginBtn.classList.add('loading');

    const result = await App.Auth.login(username, password);

    loginBtn.disabled = false;
    loginBtn.classList.remove('loading');

    if (result.success) {
      window.location.href = 'dashboard.html';
    } else {
      showError(result.error || 'Login failed. Please try again.');
      pwInput.value = '';
      pwInput.focus();
    }
  });

  /* ── Allow submit on Enter in either field ── */
  document.getElementById('loginUsername').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') form.dispatchEvent(new Event('submit', { cancelable: true }));
  });
})();
