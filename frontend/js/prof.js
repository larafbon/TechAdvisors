document.addEventListener('DOMContentLoaded', () => {
  localStorage.setItem('tech_user_role', 'professor');
  const teacherName = localStorage.getItem('tech_user_name') || 'Prof. Ana Beatriz';

  const navTeacherName = document.getElementById('nav-teacher-name');
  if (navTeacherName) navTeacherName.innerText = teacherName;

  const welcomeTitle = document.getElementById('welcome-title');
  if (welcomeTitle) welcomeTitle.innerText = `Bem-vindo(a), ${teacherName}!`;
});

function toggleUserMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById('userMenu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

document.addEventListener('click', () => {
  const menu = document.getElementById('userMenu');
  if (menu && !menu.classList.contains('hidden')) {
    menu.classList.add('hidden');
  }
});

function logout() {
  localStorage.removeItem('tech_user_name');
  localStorage.removeItem('tech_user_role');
  window.location.href = 'index.html';
}