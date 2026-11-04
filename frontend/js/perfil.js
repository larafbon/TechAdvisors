document.addEventListener('DOMContentLoaded', () => {
  carregarDadosPerfil();
});

function carregarDadosPerfil() {
  const savedUser = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('usuario')) || {};
  const userRole = savedUser.role || localStorage.getItem('tech_user_role') || 'aluno';
  const userName = savedUser.nome || localStorage.getItem('tech_user_name') || (userRole === 'professor' ? 'Prof. Ana Beatriz' : 'Lucas Silva');
  const userEmail = savedUser.email || localStorage.getItem('tech_user_email') || (userRole === 'professor' ? 'ana.nogueira@escola.edu.br' : 'lucas.silva@aluno.escola.edu.br');

  const navUserLabel = document.getElementById('nav-user-label');
  if (navUserLabel) navUserLabel.innerText = `Olá, ${userName.split(' ')[0]}`;

  const cardName = document.getElementById('profile-card-name');
  if (cardName) cardName.innerText = userName;

  const cardRole = document.getElementById('profile-card-role');
  if (cardRole) cardRole.innerText = userRole.toUpperCase();

  const cardEmail = document.getElementById('profile-card-email');
  if (cardEmail) cardEmail.innerText = userEmail;

  const avatar = document.getElementById('profile-avatar');
  if (avatar) avatar.innerText = userName.charAt(0).toUpperCase();

  const editName = document.getElementById('edit-name');
  if (editName) editName.value = userName;

  const editEmail = document.getElementById('edit-email');
  if (editEmail) editEmail.value = userEmail;

  const labelExtra1 = document.getElementById('label-extra-1');
  const valExtra1 = document.getElementById('val-extra-1');
  const labelExtra2 = document.getElementById('label-extra-2');
  const valExtra2 = document.getElementById('val-extra-2');
  const secAcessibilidade = document.getElementById('section-acessibilidade');

  if (userRole === 'professor') {
    if (labelExtra1) labelExtra1.innerText = 'CÓDIGO DOCENTE';
    if (valExtra1) valExtra1.innerText = savedUser.id_professor ? `DOC-${savedUser.id_professor}` : 'DOC2026-88';

    if (labelExtra2) labelExtra2.innerText = 'DISCIPLINAS MINISTRADAS';
    if (valExtra2) valExtra2.innerText = savedUser.disciplinas || 'Língua Portuguesa';

    // Oculta secção de acessibilidade para professor
    if (secAcessibilidade) secAcessibilidade.classList.add('hidden');
  } else {
    if (labelExtra1) labelExtra1.innerText = 'MATRÍCULA';
    if (valExtra1) valExtra1.innerText = savedUser.matricula || 'MAT202601';

    if (labelExtra2) labelExtra2.innerText = 'TURMA / SÉRIE';
    if (valExtra2) valExtra2.innerText = savedUser.serie || '9º Ano A - Manhã';

    // Exibe secção de acessibilidade apenas para aluno
    if (secAcessibilidade) secAcessibilidade.classList.remove('hidden');
  }

  const prefAudio = localStorage.getItem('pref_audio') === 'true';
  const prefVisual = localStorage.getItem('pref_visual') === 'true';
  const prefSimplificado = localStorage.getItem('pref_simplificado') === 'true';

  const chkAudio = document.getElementById('pref-audio');
  if (chkAudio) chkAudio.checked = prefAudio;

  const chkVisual = document.getElementById('pref-visual');
  if (chkVisual) chkVisual.checked = prefVisual;

  const chkSimplificado = document.getElementById('pref-simplificado');
  if (chkSimplificado) chkSimplificado.checked = prefSimplificado;
}

function salvarDadosPerfil(event) {
  event.preventDefault();
  const novoNome = document.getElementById('edit-name').value;
  const novoEmail = document.getElementById('edit-email').value;

  const savedUser = JSON.parse(localStorage.getItem('user')) || {};
  savedUser.nome = novoNome;
  savedUser.email = novoEmail;
  localStorage.setItem('user', JSON.stringify(savedUser));

  localStorage.setItem('tech_user_name', novoNome);
  localStorage.setItem('tech_user_email', novoEmail);

  alert('Dados atualizados com sucesso!');
  carregarDadosPerfil();
}

function salvarPreferenciasAcessibilidade(event) {
  event.preventDefault();
  localStorage.setItem('pref_audio', document.getElementById('pref-audio').checked);
  localStorage.setItem('pref_visual', document.getElementById('pref-visual').checked);
  localStorage.setItem('pref_simplificado', document.getElementById('pref-simplificado').checked);

  alert('Preferências salvas com sucesso!');
}

function alterarSenha(event) {
  event.preventDefault();
  const passNova = document.getElementById('pass-nova').value;
  const passConfirma = document.getElementById('pass-confirma').value;

  if (passNova.length < 8) {
    alert('A nova senha deve ter pelo menos 8 caracteres.');
    return;
  }
  if (passNova !== passConfirma) {
    alert('As senhas não coincidem.');
    return;
  }

  localStorage.setItem('tech_user_password', passNova);
  alert('Senha alterada com sucesso!');
  document.getElementById('form-perfil-senha').reset();
}

function toggleUserMenu(event) {
  if (event) event.stopPropagation();
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
  const savedUser = JSON.parse(localStorage.getItem('user')) || {};
  const role = savedUser.role || localStorage.getItem('tech_user_role') || 'aluno';
  if (role === 'professor') {
    window.location.href = 'professor.html';
  } else {
    window.location.href = 'alunos.html';
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}