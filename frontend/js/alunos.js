document.addEventListener('DOMContentLoaded', function () {
  try {
    const user = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('usuario')) || { nome: 'Aluno', role: 'aluno' };

    const welcomeTitle = document.getElementById('student-welcome-title');
    if (welcomeTitle) {
      welcomeTitle.innerText = `Bem-vindo(a), ${user.nome || 'Aluno'}!`;
    }

    const nameNav = document.getElementById('student-name-nav');
    if (nameNav && nameNav.querySelector('span')) {
      nameNav.querySelector('span').innerText = `🎓 ${user.nome || 'Aluno'}`;
    }
  } catch (error) {
    console.warn('Erro ao carregar dados do aluno:', error);
  }
});

function toggleUserMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('userMenu') || document.getElementById('user-dropdown');
  if (menu) {
    menu.classList.toggle('show');
  }
}

window.addEventListener('click', function (e) {
  const menu = document.getElementById('userMenu') || document.getElementById('user-dropdown');
  const navBtn = document.getElementById('student-name-nav');
  if (menu && menu.classList.contains('show')) {
    if (!menu.contains(e.target) && navBtn && !navBtn.contains(e.target)) {
      menu.classList.remove('show');
    }
  }
});

function minhaConta() {
  alert('Acessando o perfil do aluno...');
}

function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}