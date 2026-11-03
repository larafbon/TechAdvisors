document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('usuario'));
 
  if (!user || user.role !== 'professor') {
    alert('Acesso restrito a professores logados.');
    window.location.href = 'index.html';
    return;
  }

  const welcomeTitle = document.getElementById('prof-welcome-title');
  if (welcomeTitle) {
    welcomeTitle.innerText = `Bem-vindo(a), ${user.nome || 'Professor'}!`;
  }

  const profNav = document.getElementById('prof-name-nav');
  if (profNav && profNav.querySelector('span')) {
    profNav.querySelector('span').innerText = `👨‍🏫 ${user.nome || 'Professor'}`;
  }
});

function toggleUserMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('userMenu') || document.getElementById('user-dropdown');
  if (menu) {
    menu.classList.toggle('show');
  }
}

window.addEventListener('click', function(e) {
  const menu = document.getElementById('userMenu') || document.getElementById('user-dropdown');
  const navBtn = document.getElementById('prof-name-nav');
  if (menu && menu.classList.contains('show')) {
    if (!menu.contains(e.target) && navBtn && !navBtn.contains(e.target)) {
      menu.classList.remove('show');
    }
  }
});

function minhaConta() {
  alert('Acessando: Minha Conta');
}

function configuracoes() {
  if (typeof toggleSettingsDrawer === 'function') {
    toggleSettingsDrawer(true);
  } else {
    alert('Acessando: Configurações');
  }
}

function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}
 