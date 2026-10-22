

window.onload = function() {
    const user = JSON.parse(localStorage.getItem('user'));
   
   
    if (!user || user.role !== 'professor') {
      alert('Acesso restrito a professores logados.');
      window.location.href = 'index.html';
    } else {
      document.getElementById('prof-welcome-title').innerText = `Bem-vindo(a), ${user.nome || 'Professor'}!`;
      document.getElementById('prof-name-nav').querySelector('span').innerText = `👨‍🏫 ${user.nome || 'Professor'}`;
    }
   };
   
   
   
   
   function toggleUserMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('show');
   }
   
   
   
   
   window.addEventListener('click', function(e) {
    const menu = document.getElementById('userMenu');
    if (menu && menu.classList.contains('show')) {
      menu.classList.remove('show');
    }
   });
   
   
   
   
   function minhaConta() {
    alert('Acessando: Minha Conta');
   }
   
   
   
   
   function configuracoes() {
    alert('Acessando: Configurações');
   }
   
   
   
   
   function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
   }
   
   
   
   