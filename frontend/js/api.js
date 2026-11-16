async function apiFetch(url, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  };
  const res = await fetch(url, config);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Wystąpił błąd serwera');
    err.status = res.status;
    throw err;
  }
  return data;
}

function showAlert(boxId, textId, msg, type = 'success') {
  const box = document.getElementById(boxId);
  if (!box) return;
  box.className = `alert alert-${type} alert-dismissible fade show`;
  document.getElementById(textId).textContent = msg;
}

function formatDatePL(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return String(isoDate).slice(0, 10);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
