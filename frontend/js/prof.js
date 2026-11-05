document.addEventListener('DOMContentLoaded', () => {
  const userString = localStorage.getItem('tech_user');
  
  if (!userString) {
    // Se não houver sessão ativa, impede acesso e redireciona ao login
    window.location.href = 'index.html';
    return;
  }

  const user = JSON.parse(userString);

  // Redireciona caso um aluno tente acessar a página de professor
  if (user.role !== 'professor') {
    window.location.href = 'alunos.html';
    return;
  }

  // Preenche a interface com os dados reais do professor logado
  const navTeacherName = document.getElementById('nav-teacher-name');
  if (navTeacherName) navTeacherName.innerText = user.nome;

  const welcomeTitle = document.getElementById('welcome-title');
  if (welcomeTitle) welcomeTitle.innerText = `Bem-vindo(a), ${user.nome}!`;
});

function toggleUserMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('userMenu');
  if (menu) {
    menu.classList.toggle('show');
  }
}

document.addEventListener('click', () => {
  const menu = document.getElementById('userMenu');
  if (menu && menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}