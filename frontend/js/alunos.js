window.onload = function () {
    const user = JSON.parse(localStorage.getItem('user'));
  
    if (!user || user.role !== 'aluno') {
      window.location.href = 'index.html';
      return;
    }
  
    const welcomeTitle = document.getElementById('student-welcome-title');
    if (welcomeTitle) {
      welcomeTitle.innerText = `Bem-vindo(a), ${user.nome || 'Aluno'}!`;
    }
  
    const nameNav = document.getElementById('student-name-nav');
    if (nameNav && nameNav.querySelector('span')) {
      nameNav.querySelector('span').innerText = `🎓 ${user.nome || 'Aluno'}`;
    }
  };
  
  function toggleUserMenu(event) {
    event.stopPropagation();
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