const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const authenticatedKey = 'transferAuthenticated';

if (sessionStorage.getItem(authenticatedKey) === 'true') {
  window.location.replace('index.html');
}

loginForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (username === 'lhehopee' && password === 'hopee1e') {
    sessionStorage.setItem(authenticatedKey, 'true');
    window.location.replace('index.html');
    return;
  }

  loginError.textContent = 'Tên đăng nhập hoặc mật khẩu không chính xác.';
  document.getElementById('password').focus();
});
