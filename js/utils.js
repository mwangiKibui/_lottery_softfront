/* =====================================================================
   PRINCE LOTO — Utilities
   Shared helper functions used across all pages.
   ===================================================================== */

window.App = window.App || {};

App.Utils = {
  /* ── Formatting ── */
  formatMoney(val) {
    if (val == null || isNaN(val)) return '$0';
    return '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    } catch { return dateStr; }
  },

  formatPercent(val) {
    return `${Number(val).toFixed(1)}%`;
  },

  /* ── DOM Helpers ── */
  qs(selector, root = document) {
    return root.querySelector(selector);
  },

  qsa(selector, root = document) {
    return [...root.querySelectorAll(selector)];
  },

  el(tag, className, html = '') {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (html) e.innerHTML = html;
    return e;
  },

  /* ── Badge HTML ── */
  badge(text, type = 'success') {
    return `<span class="badge badge-${type}">${text}</span>`;
  },

  /* ── Toast Notifications ── */
  toast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const iconMap = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const icon = iconMap[type] || 'fa-info-circle';

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fade');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
  },

  /* ── Loading row for tables ── */
  tableLoadingRow(colSpan = 5) {
    return `<tr class="loading-row"><td colspan="${colSpan}"><span class="spinner"></span> Loading...</td></tr>`;
  },

  tableEmptyRow(message = 'No records found.', colSpan = 5) {
    return `<tr><td colspan="${colSpan}" class="table-empty">${message}</td></tr>`;
  },

  /* ── Simulated async delay ── */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /* ── Input sanitization (basic XSS) ── */
  escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /* ── Build URL query string ── */
  buildQuery(params) {
    return Object.entries(params)
      .filter(([, v]) => v !== '' && v != null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
  },
};
