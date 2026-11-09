document.addEventListener('DOMContentLoaded', () => {
  const userString = localStorage.getItem('tech_user');
  
  if (!userString) {
    window.location.href = 'index.html';
    return;
  }

  const user = JSON.parse(userString);

  const navStudentName = document.getElementById('nav-student-name');
  if (navStudentName) navStudentName.innerText = user.nome;

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

document.addEventListener('click', (e) => {
  const menu = document.getElementById('userMenu');
  if (menu && menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}