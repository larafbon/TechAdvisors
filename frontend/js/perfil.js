document.addEventListener('DOMContentLoaded', () => {
    carregarDadosPerfil();
  });
  
  function carregarDadosPerfil() {
    const userRole = localStorage.getItem('tech_user_role') || 'aluno';
    const userName = localStorage.getItem('tech_user_name') || (userRole === 'professor' ? 'Prof. Ana Beatriz' : 'Lucas Silva');
    const userEmail = localStorage.getItem('tech_user_email') || (userRole === 'professor' ? 'ana.nogueira@escola.edu.br' : 'lucas.silva@aluno.escola.edu.br');
  
    const navUserLabel = document.getElementById('nav-user-label');
    if (navUserLabel) navUserLabel.innerText = `Olá, ${userName.split(' ')[0]}`;
  
    document.getElementById('profile-card-name').innerText = userName;
    document.getElementById('profile-card-role').innerText = userRole.toUpperCase();
    document.getElementById('profile-card-email').innerText = userEmail;
    document.getElementById('profile-avatar').innerText = userName.charAt(0).toUpperCase();
  
    document.getElementById('edit-name').value = userName;
    document.getElementById('edit-email').value = userEmail;
  
    if (userRole === 'professor') {
      document.getElementById('val-extra-1').innerText = 'DOC2026-88';
      document.getElementById('val-extra-2').innerText = 'Língua Portuguesa';
    } else {
      document.getElementById('val-extra-1').innerText = 'MAT202601';
      document.getElementById('val-extra-2').innerText = '9º Ano A - Manhã';
    }
  
    const prefAudio = localStorage.getItem('pref_audio') === 'true';
    const prefVisual = localStorage.getItem('pref_visual') === 'true';
    const prefSimplificado = localStorage.getItem('pref_simplificado') === 'true';
  
    document.getElementById('pref-audio').checked = prefAudio;
    document.getElementById('pref-visual').checked = prefVisual;
    document.getElementById('pref-simplificado').checked = prefSimplificado;
  }
  
  function salvarDadosPerfil(event) {
    event.preventDefault();
    const novoNome = document.getElementById('edit-name').value;
    const novoEmail = document.getElementById('edit-email').value;
  
    localStorage.setItem('tech_user_name', novoNome);
    localStorage.setItem('tech_user_email', novoEmail);
  
    alert('Dados pessoais atualizados com sucesso!');
    carregarDadosPerfil();
  }
  
  function salvarPreferenciasAcessibilidade(event) {
    event.preventDefault();
    const audio = document.getElementById('pref-audio').checked;
    const visual = document.getElementById('pref-visual').checked;
    const simplificado = document.getElementById('pref-simplificado').checked;
  
    localStorage.setItem('pref_audio', audio);
    localStorage.setItem('pref_visual', visual);
    localStorage.setItem('pref_simplificado', simplificado);
  
    alert('Preferências de acessibilidade salvas com sucesso!');
  }
  
  function alterarSenha(event) {
    event.preventDefault();
    const passAtual = document.getElementById('pass-atual').value;
    const passNova = document.getElementById('pass-nova').value;
    const passConfirma = document.getElementById('pass-confirma').value;
  
    if (passNova.length < 8) {
      alert('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
  
    if (passNova !== passConfirma) {
      alert('A confirmação da nova senha não coincide com a nova senha digitada.');
      return;
    }
  
    // Armazena a senha fictícia no localStorage para fins demonstrativos
    localStorage.setItem('tech_user_password', passNova);
  
    alert('Senha alterada com sucesso! (Armazenada na sessão demonstrativa)');
    document.getElementById('form-perfil-senha').reset();
  }
  
  function toggleUserMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('userMenu');
    if (menu) menu.classList.toggle('show');
  }
  
  document.addEventListener('click', () => {
    const menu = document.getElementById('userMenu');
    if (menu && menu.classList.contains('show')) {
      menu.classList.remove('show');
    }
  });
  
  function voltarAoPainel() {
    const role = localStorage.getItem('tech_user_role') || 'aluno';
    if (role === 'professor') {
      window.location.href = 'professor.html';
    } else {
      window.location.href = 'alunos.html';
    }
  }
  
  function logout() {
    localStorage.removeItem('tech_user_name');
    localStorage.removeItem('tech_user_role');
    window.location.href = 'index.html';
  }