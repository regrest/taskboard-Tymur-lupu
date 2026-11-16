document.addEventListener('DOMContentLoaded', async () => {
  try {
    await apiFetch('/api/auth/me');
    window.location.href = 'boards.html';
    return;
  } catch {}

  document.getElementById('tabLogin').addEventListener('click', () => {
    document.getElementById('tabLogin').classList.add('active');
    document.getElementById('tabRegister').classList.remove('active');
    document.getElementById('loginForm').classList.remove('d-none');
    document.getElementById('registerForm').classList.add('d-none');
    document.getElementById('authAlert').classList.add('d-none');
  });

  document.getElementById('tabRegister').addEventListener('click', () => {
    document.getElementById('tabRegister').classList.add('active');
    document.getElementById('tabLogin').classList.remove('active');
    document.getElementById('registerForm').classList.remove('d-none');
    document.getElementById('loginForm').classList.add('d-none');
    document.getElementById('authAlert').classList.add('d-none');
  });

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const login = document.getElementById('loginInput').value.trim();
    const password = document.getElementById('loginPasswordInput').value;
    try {
      await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, password })
      });
      window.location.href = 'boards.html';
    } catch (err) {
      showAlert('authAlert', 'authAlertText', err.message, 'danger');
    }
  });

  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const loginEl = document.getElementById('regLogin');
    const fnEl = document.getElementById('regFirstName');
    const lnEl = document.getElementById('regLastName');
    const passEl = document.getElementById('regPassword');
    const confirmEl = document.getElementById('regPasswordConfirm');

    const loginValid = /^[a-zA-Z0-9._-]{3,30}$/.test(loginEl.value.trim());
    const fnValid = fnEl.value.trim().length > 0;
    const lnValid = lnEl.value.trim().length > 0;
    const passValid = passEl.value.length >= 8;
    const confirmValid = passEl.value === confirmEl.value && confirmEl.value.length > 0;

    loginEl.classList.toggle('is-invalid', !loginValid);
    fnEl.classList.toggle('is-invalid', !fnValid);
    lnEl.classList.toggle('is-invalid', !lnValid);
    passEl.classList.toggle('is-invalid', !passValid);
    confirmEl.classList.toggle('is-invalid', !confirmValid);

    if (!loginValid || !fnValid || !lnValid || !passValid || !confirmValid) return;

    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          login: loginEl.value.trim(),
          firstName: fnEl.value.trim(),
          lastName: lnEl.value.trim(),
          password: passEl.value
        })
      });
      window.location.href = 'boards.html';
    } catch (err) {
      showAlert('authAlert', 'authAlertText', err.message, 'danger');
    }
  });

  document.getElementById('closeAuthAlert').addEventListener('click', () => {
    document.getElementById('authAlert').classList.add('d-none');
  });
});
