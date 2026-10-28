document.addEventListener('DOMContentLoaded', function () {
  try {
    // Pega os dados do usuário salvos no navegador (ou usa um padrão para testes)
    const user = JSON.parse(localStorage.getItem('user')) || { nome: 'Aluno', role: 'aluno' };

    // Atualiza o título principal
    const welcomeTitle = document.getElementById('student-welcome-title');
    if (welcomeTitle) {
      welcomeTitle.innerText = `Bem-vindo(a), ${user.nome || 'Aluno'}!`;
    }

    // Atualiza o nome na barra superior
    const nameNav = document.getElementById('student-name-nav');
    if (nameNav && nameNav.querySelector('span')) {
      nameNav.querySelector('span').innerText = `🎓 ${user.nome || 'Aluno'}`;
    }
  } catch (error) {
    console.warn('Erro ao carregar dados do aluno no localStorage:', error);
  }
});

function toggleUserMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('userMenu');
  if (menu) {
    menu.classList.toggle('show');
  }
}

window.addEventListener('click', function (e) {
  const menu = document.getElementById('userMenu');
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
  window.location.href = 'index.html';
}