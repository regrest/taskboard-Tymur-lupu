const PRIO_LABEL = {
  high: 'Wysoki',
  medium: 'Średni',
  low: 'Niski'
};

async function apiRequest(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (res.status === 204) {
    return null;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Błąd ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

function showError(msg) {
  const box = document.getElementById('alertBox');
  const text = document.getElementById('alertText');
  if (!box || !text) return;
  text.textContent = msg;
  box.classList.remove('d-none');
  document.getElementById('infoBox')?.classList.add('d-none');
}

function hideError() {
  document.getElementById('alertBox')?.classList.add('d-none');
}

function showInfo(msg) {
  const box = document.getElementById('infoBox');
  const text = document.getElementById('infoText');
  if (!box || !text) return;
  text.textContent = msg;
  box.classList.remove('d-none');
  document.getElementById('alertBox')?.classList.add('d-none');
}

function hideInfo() {
  document.getElementById('infoBox')?.classList.add('d-none');
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDatePl(dateStr) {
  if (!dateStr) return '';
  const clean = String(dateStr).slice(0, 10);
  const [y, m, d] = clean.split('-');
  return y && m && d ? `${d}.${m}.${y}` : clean;
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'done') return false;
  const today = new Date().toISOString().slice(0, 10);
  return String(dateStr).slice(0, 10) < today;
}

async function requireSessionOrRedirect() {
  try {
    const user = await apiRequest('/api/auth/me');
    const label = document.getElementById('loggedUserLabel');
    if (label) {
      label.textContent = `Zalogowano: ${user.firstName} ${user.lastName}`;
    }
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && !logoutBtn.dataset.bound) {
      logoutBtn.dataset.bound = '1';
      logoutBtn.addEventListener('click', async () => {
        await apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => {});
        window.location.href = '/login.html';
      });
    }
    return user;
  } catch {
    window.location.href = '/login.html';
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('alertCloseBtn')?.addEventListener('click', hideError);
  document.getElementById('infoCloseBtn')?.addEventListener('click', hideInfo);
});