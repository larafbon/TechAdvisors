document.addEventListener('DOMContentLoaded', () => {
  const userName = localStorage.getItem('tech_user_name') || 'Lucas Silva';
  
  const navStudentName = document.getElementById('nav-student-name');
  if (navStudentName) navStudentName.innerText = userName;

  const welcomeTitle = document.getElementById('welcome-title');
  if (welcomeTitle) welcomeTitle.innerText = `Bem-vindo(a), ${userName}!`;
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
  localStorage.removeItem('tech_user_name');
  localStorage.removeItem('tech_user_role');
  window.location.href = 'index.html';
}