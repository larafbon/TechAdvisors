document.addEventListener('DOMContentLoaded', () => {
  carregarDadosPerfil();
});

function carregarDadosPerfil() {
  const userString = localStorage.getItem('tech_user');
  if (!userString) {
    window.location.href = 'index.html';
    return;
  }

  const user = JSON.parse(userString);
  const userRole = user.role || 'aluno';
  const userName = user.nome || 'Usuário';
  const userEmail = user.email || '';

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
    if (valExtra1) valExtra1.innerText = user.id_professor ? `DOC-${user.id_professor}` : `DOC-${user.id}`;

    if (labelExtra2) labelExtra2.innerText = 'DISCIPLINAS MINISTRADAS';
    if (valExtra2) valExtra2.innerText = user.disciplinas || 'Não informada';

    if (secAcessibilidade) secAcessibilidade.classList.add('hidden');
  } else {
    if (labelExtra1) labelExtra1.innerText = 'MATRÍCULA';
    if (valExtra1) valExtra1.innerText = user.matricula || `MAT-${user.id}`;

    if (labelExtra2) labelExtra2.innerText = 'TURMA / SÉRIE';
    if (valExtra2) valExtra2.innerText = user.serie || 'Turma não atribuída';

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

  const userString = localStorage.getItem('tech_user');
  if (userString) {
    const user = JSON.parse(userString);
    user.nome = novoNome;
    user.email = novoEmail;
    localStorage.setItem('tech_user', JSON.stringify(user));
  }

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
  const userString = localStorage.getItem('tech_user');
  const user = userString ? JSON.parse(userString) : {};
  if (user.role === 'professor') {
    window.location.href = 'professor.html';
  } else {
    window.location.href = 'alunos.html';
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}