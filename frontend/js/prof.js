document.addEventListener('DOMContentLoaded', () => {
  localStorage.setItem('tech_user_role', 'professor');
  const teacherName = localStorage.getItem('tech_user_name') || 'Prof. Ana Beatriz';

  const navTeacherName = document.getElementById('nav-teacher-name');
  if (navTeacherName) navTeacherName.innerText = teacherName;

  const welcomeTitle = document.getElementById('welcome-title');
  if (welcomeTitle) welcomeTitle.innerText = `Bem-vindo(a), ${teacherName}!`;
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