const API_URL = 'http://127.0.0.1:8000';
let selectedRole = 'aluno';
// Função para alternar visibilidade da senha (Olho Aberto / Olho Fechado)
function togglePasswordVisibility(inputId, eyeIconId) {
 const input = document.getElementById(inputId);
 const eyeIcon = document.getElementById(eyeIconId);
  if (input.type === 'password') {
   input.type = 'text';
   // SVG Olho Aberto
   eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
 } else {
   input.type = 'password';
   // SVG Olho Fechado
   eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M3 3l18 18"></path>`;
 }
}








// Navegação entre as telas internas do index.html (Home, Login e Cadastro)
function navigateTo(screenName) {
 if (screenName === 'dashboard-professor') {
   window.location.href = 'professor.html';
   return;
 }
  document.getElementById('screen-home').classList.remove('active');
 document.getElementById('screen-login').classList.remove('active');
 document.getElementById('screen-register-step1').classList.remove('active');
 document.getElementById('screen-register-step2').classList.remove('active');
  if (screenName === 'home') {
   document.getElementById('screen-home').classList.add('active');
 } else if (screenName === 'login') {
   document.getElementById('screen-login').classList.add('active');
 }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
// Inicia o fluxo de cadastro na Etapa 1
function startRegistration() {
 document.getElementById('screen-home').classList.remove('active');
 document.getElementById('screen-login').classList.remove('active');
 document.getElementById('screen-register-step2').classList.remove('active');
 document.getElementById('screen-register-step1').classList.add('active');
 window.scrollTo({ top: 0, behavior: 'smooth' });
}
// Seleção de perfil no Cadastro (Aluno, Professor, Admin)
function selectRole(role) {
 selectedRole = role;
 document.getElementById('card-aluno').classList.remove('selected');
 document.getElementById('card-professor').classList.remove('selected');
 document.getElementById('card-admin').classList.remove('selected');
 document.getElementById(`card-${role}`).classList.add('selected');
}
// Avança para a Etapa 2 do cadastro adaptando os campos
function goToStep2() {
 document.getElementById('screen-register-step1').classList.remove('active');
 document.getElementById('screen-register-step2').classList.add('active');
 const iconEl = document.getElementById('header-role-icon');
 const titleEl = document.getElementById('header-role-title');
 const fieldsAluno = document.getElementById('fields-aluno');
 const fieldsProfessor = document.getElementById('fields-professor');
 const fieldsAdmin = document.getElementById('fields-admin');
  fieldsAluno.classList.add('hidden');
 fieldsProfessor.classList.add('hidden');
 fieldsAdmin.classList.add('hidden');
  if (selectedRole === 'aluno') {
   iconEl.innerText = '🎓';
   titleEl.innerText = 'CADASTRO DE ALUNO';
   fieldsAluno.classList.remove('hidden');
 } else if (selectedRole === 'professor') {
   iconEl.innerText = '👨‍🏫';
   titleEl.innerText = 'CADASTRO DE PROFESSOR';
   fieldsProfessor.classList.remove('hidden');
 } else if (selectedRole === 'admin') {
   iconEl.innerText = '⚙️';
   titleEl.innerText = 'CADASTRO DE ADMIN';
   fieldsAdmin.classList.remove('hidden');
 }
 window.scrollTo({ top: 0, behavior: 'smooth' });
}
// Volta para a seleção de perfil no cadastro
function goToStep1() {
 document.getElementById('screen-register-step2').classList.remove('active');
 document.getElementById('screen-register-step1').classList.add('active');
 window.scrollTo({ top: 0, behavior: 'smooth' });
}
// Envio do formulário de cadastro para a API FastAPI
async function handleFinalRegister(event) {
 event.preventDefault();
 const name = document.getElementById('reg-name').value;
 const email = document.getElementById('reg-email').value;
 const password = document.getElementById('reg-password').value;
  // Captura o input da disciplina
 const discInput = document.getElementById('prof-disciplina');
 const disciplinaVal = discInput ? discInput.value.trim() : '';








 // Captura a série selecionada
 const serieSelect = document.getElementById('aluno-serie');
 const serieVal = serieSelect ? serieSelect.value : '';
  let endpoint = '/responsaveis';
 let payload = { nome: name, email: email, senha: password };
  if (selectedRole === 'professor') {
   endpoint = '/professores';
   payload = {
     nome: name,
     email: email,
     senha: password,
     disciplinas: disciplinaVal,
     status: 'ativo'
   };
 } else if (selectedRole === 'aluno') {
   endpoint = '/responsaveis';
   payload = {
     nome: name,
     email: email,
     senha: password,
     serie: serieVal
   };
 }
  try {
   const response = await fetch(`${API_URL}${endpoint}`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json'
     },
     body: JSON.stringify(payload)
   });
    if (response.ok) {
     const usuarioCriado = await response.json();
      // SALVA A DISCIPLINA OU SÉRIE NA SESSÃO DO LOCALSTORAGE
     localStorage.setItem('user', JSON.stringify({
       id: usuarioCriado.id_professor || usuarioCriado.id_responsavel,
       nome: name,
       email: email,
       disciplinas: usuarioCriado.disciplinas || disciplinaVal,
       serie: serieVal,
       role: selectedRole
     }));
      // Redireciona imediatamente sem pop-up de confirmação
     redirectUser(selectedRole);
   } else {
     const erro = await response.json();
     let msg = 'Verifique os dados informados.';
     if (typeof erro.detail === 'string') msg = erro.detail;
     else if (Array.isArray(erro.detail)) msg = erro.detail.map(e => `${e.loc[e.loc.length-1]}: ${e.msg}`).join('\n');
      alert(`Erro ao realizar cadastro:\n${msg}`);
   }
 } catch (error) {
   console.error('Erro na conexão com o servidor:', error);
   alert('Não foi possível conectar ao servidor FastAPI na porta 8000.');
 }
}
// Autenticação de Login na API FastAPI
async function handleLogin(event) {
 event.preventDefault();
 const emailInput = document.getElementById('login-email').value;
 const passwordInput = document.getElementById('login-password').value;
  try {
   const response = await fetch(`${API_URL}/login`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       email: emailInput,
       senha: passwordInput
     })
   });
    if (response.ok) {
     const usuarioBD = await response.json();
     localStorage.setItem('user', JSON.stringify(usuarioBD));
     redirectUser(usuarioBD.role);
   } else {
     const erro = await response.json();
     alert(`Falha no login: ${erro.detail || 'E-mail ou senha incorretos.'}`);
   }
 } catch (error) {
   console.error('Erro ao efetuar login:', error);
   alert('Erro ao conectar com o servidor FastAPI.');
 }
}
// Redireciona o usuário para a página correspondente ao seu papel
function redirectUser(role) {
 if (role === 'admin') {
   alert('Redirecionando para o Painel Administrador...');
   navigateTo('home');
 } else if (role === 'professor') {
   window.location.href = 'professor.html';
 } else {
   alert('Login realizado como Aluno/Responsável.');
   navigateTo('home');
 }
}
// Verifica a sessão para navegação direta ao Dashboard
function handleDashboardNavigation() {
 const savedUser = JSON.parse(localStorage.getItem('user'));
 if (!savedUser) {
   alert('Por favor, faça login para acessar o Dashboard.');
   navigateTo('login');
 } else {
   redirectUser(savedUser.role);
 }
}
// Encerra a sessão
function logout() {
 localStorage.removeItem('user');
 window.location.href = 'index.html';
}



