document.addEventListener('DOMContentLoaded', async () => {
  try {
    await apiRequest('/api/auth/me');
    window.location.href = '/boards.html';
    return;
  } catch {
    // użytkownik niezalogowany — zostaje na login.html
  }

  const tabLogin = document.getElementById('tabLoginBtn');
  const tabRegister = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  tabLogin.addEventListener('click', () => {
    hideError();
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.remove('d-none');
    registerForm.classList.add('d-none');
  });

  tabRegister.addEventListener('click', () => {
    hideError();
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.remove('d-none');
    loginForm.classList.add('d-none');
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    const login = document.getElementById('loginInput').value.trim();
    const password = document.getElementById('passwordInput').value;

    try {
      await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, password })
      });
      window.location.href = '/boards.html';
    } catch (err) {
      showError(err.message);
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const loginEl = document.getElementById('regLogin');
    const firstEl = document.getElementById('regFirstName');
    const lastEl = document.getElementById('regLastName');
    const passEl = document.getElementById('regPassword');
    const confEl = document.getElementById('regPasswordConfirm');

    [loginEl, firstEl, lastEl, passEl, confEl].forEach((el) => el.classList.remove('is-invalid'));

    const login = loginEl.value.trim();
    const firstName = firstEl.value.trim();
    const lastName = lastEl.value.trim();
    const password = passEl.value;
    const confirm = confEl.value;

    let valid = true;
    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(login)) {
      loginEl.classList.add('is-invalid');
      valid = false;
    }
    if (!firstName) {
      firstEl.classList.add('is-invalid');
      valid = false;
    }
    if (!lastName) {
      lastEl.classList.add('is-invalid');
      valid = false;
    }
    if (password.length < 8) {
      passEl.classList.add('is-invalid');
      valid = false;
    }
    if (password !== confirm) {
      confEl.classList.add('is-invalid');
      valid = false;
    }
    if (!valid) return;

    try {
      await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ login, firstName, lastName, password })
      });
      window.location.href = '/boards.html';
    } catch (err) {
      showError(err.message);
    }
  });
});