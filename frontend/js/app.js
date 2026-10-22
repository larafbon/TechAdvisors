import { api } from './api.js';


// ==========================================
// UTILS & NAVEGAÇÃO SILENCIOSA
// ==========================================
function setFeedback(elementId, message, isError = false) {
   const el = document.getElementById(elementId);
   if (el) {
       el.textContent = message;
       el.style.color = isError ? '#d32f2f' : '#2e7d32';
       setTimeout(() => { el.textContent = ''; }, 4000);
   }
}


// ==========================================
// 1. PROFESSORES
// ==========================================
async function carregarProfessores() {
   const lista = document.getElementById('lista-professores');
   if (!lista) return;


   try {
       const dados = await api.professores.listar();
       lista.innerHTML = '';
       dados.forEach(item => {
           const li = document.createElement('li');
           li.className = 'card-item';
           li.innerHTML = `
               <div>
                   <strong>${item.nome}</strong> (${item.status || 'ativo'})
                   <br><small>${item.email}</small>
               </div>
               <button class="btn-deletar" data-id="${item.id_professor}">Excluir</button>
           `;
           lista.appendChild(li);
       });


       lista.querySelectorAll('.btn-deletar').forEach(btn => {
           btn.onclick = async (e) => {
               const id = e.target.getAttribute('data-id');
               if (confirm('Deseja excluir este professor?')) {
                   await api.professores.deletar(id);
                   carregarProfessores();
               }
           };
       });
   } catch (err) {
       console.error('[Professores] Erro ao carregar:', err);
   }
}


const formProfessor = document.getElementById('form-professor');
if (formProfessor) {
   formProfessor.addEventListener('submit', async (e) => {
       e.preventDefault();
       const novo = {
           nome: document.getElementById('prof-nome').value,
           email: document.getElementById('prof-email').value,
           senha: document.getElementById('prof-senha').value,
           status: document.getElementById('prof-status')?.value || 'ativo'
       };


       try {
           await api.professores.criar(novo);
           formProfessor.reset();
           setFeedback('feedback-prof', 'Professor cadastrado com sucesso!');
           carregarProfessores();
       } catch (err) {
           setFeedback('feedback-prof', 'Erro: ' + err.message, true);
       }
   });
}


// ==========================================
// 2. RESPONSÁVEIS
// ==========================================
async function carregarResponsaveis() {
   const lista = document.getElementById('lista-responsaveis');
   if (!lista) return;


   try {
       const dados = await api.responsaveis.listar();
       lista.innerHTML = '';
       dados.forEach(item => {
           const li = document.createElement('li');
           li.className = 'card-item';
           li.innerHTML = `
               <div>
                   <strong>${item.nome}</strong>
                   <br><small>CPF: ${item.cpf || 'N/I'} | E-mail: ${item.email || 'N/I'}</small>
               </div>
               <button class="btn-deletar" data-id="${item.id_responsavel}">Excluir</button>
           `;
           lista.appendChild(li);
       });


       lista.querySelectorAll('.btn-deletar').forEach(btn => {
           btn.onclick = async (e) => {
               const id = e.target.getAttribute('data-id');
               if (confirm('Deseja excluir este responsável?')) {
                   await api.responsaveis.deletar(id);
                   carregarResponsaveis();
               }
           };
       });
   } catch (err) {
       console.error('[Responsáveis] Erro ao carregar:', err);
   }
}


const formResponsavel = document.getElementById('form-responsavel');
if (formResponsavel) {
   formResponsavel.addEventListener('submit', async (e) => {
       e.preventDefault();
       const novo = {
           nome: document.getElementById('resp-nome').value,
           cpf: document.getElementById('resp-cpf')?.value || null,
           email: document.getElementById('resp-email')?.value || null,
           telefone: document.getElementById('resp-telefone')?.value || null,
           senha: document.getElementById('resp-senha')?.value || null
       };


       try {
           await api.responsaveis.criar(novo);
           formResponsavel.reset();
           setFeedback('feedback-resp', 'Responsável cadastrado com sucesso!');
           carregarResponsaveis();
       } catch (err) {
           setFeedback('feedback-resp', 'Erro: ' + err.message, true);
       }
   });
}


// ==========================================
// 3. TURMAS
// ==========================================
async function carregarTurmas() {
   const lista = document.getElementById('lista-turmas');
   if (!lista) return;


   try {
       const dados = await api.turmas.listar();
       lista.innerHTML = '';
       dados.forEach(item => {
           const li = document.createElement('li');
           li.className = 'card-item';
           li.innerHTML = `
               <div>
                   <strong>${item.codigo_turma} - ${item.nome_turma}</strong>
                   <br><small>${item.serie_ano} | ${item.disciplina} | Turno: ${item.turno}</small>
               </div>
               <button class="btn-deletar" data-id="${item.id_turma}">Excluir</button>
           `;
           lista.appendChild(li);
       });


       lista.querySelectorAll('.btn-deletar').forEach(btn => {
           btn.onclick = async (e) => {
               const id = e.target.getAttribute('data-id');
               if (confirm('Deseja excluir esta turma?')) {
                   await api.turmas.deletar(id);
                   carregarTurmas();
               }
           };
       });
   } catch (err) {
       console.error('[Turmas] Erro ao carregar:', err);
   }
}


const formTurma = document.getElementById('form-turma');
if (formTurma) {
   formTurma.addEventListener('submit', async (e) => {
       e.preventDefault();
       const nova = {
           codigo_turma: document.getElementById('turma-codigo').value,
           nome_turma: document.getElementById('turma-nome').value,
           serie_ano: document.getElementById('turma-serie').value,
           disciplina: document.getElementById('turma-disciplina').value,
           turno: document.getElementById('turma-turno').value,
           ano_letivo: parseInt(document.getElementById('turma-ano').value, 10),
           id_professor: parseInt(document.getElementById('turma-professor').value, 10),
           status_turma: 'ativa'
       };


       try {
           await api.turmas.criar(nova);
           formTurma.reset();
           setFeedback('feedback-turma', 'Turma criada com sucesso!');
           carregarTurmas();
       } catch (err) {
           setFeedback('feedback-turma', 'Erro: ' + err.message, true);
       }
   });
}


// ==========================================
// 4. ALUNOS & ACESSIBILIDADE
// ==========================================
async function carregarAlunos() {
   const lista = document.getElementById('lista-alunos');
   if (!lista) return;


   try {
       const dados = await api.alunos.listar();
       lista.innerHTML = '';
       dados.forEach(item => {
           const li = document.createElement('li');
           li.className = 'card-item';
           li.innerHTML = `
               <div>
                   <strong>${item.nome}</strong> (Matrícula: ${item.matricula})
                   <br><small>Nascimento: ${item.data_nascimento}</small>
               </div>
               <button class="btn-deletar" data-id="${item.id_aluno}">Excluir</button>
           `;
           lista.appendChild(li);
       });


       lista.querySelectorAll('.btn-deletar').forEach(btn => {
           btn.onclick = async (e) => {
               const id = e.target.getAttribute('data-id');
               if (confirm('Deseja excluir este aluno?')) {
                   await api.alunos.deletar(id);
                   carregarAlunos();
               }
           };
       });
   } catch (err) {
       console.error('[Alunos] Erro ao carregar:', err);
   }
}


const formAluno = document.getElementById('form-aluno');
if (formAluno) {
   formAluno.addEventListener('submit', async (e) => {
       e.preventDefault();
       const novo = {
           nome: document.getElementById('aluno-nome').value,
           matricula: document.getElementById('aluno-matricula').value,
           data_nascimento: document.getElementById('aluno-nascimento').value,
           email: document.getElementById('aluno-email')?.value || null,
           id_turma: document.getElementById('aluno-turma')?.value ? parseInt(document.getElementById('aluno-turma').value, 10) : null,
           id_responsavel: document.getElementById('aluno-responsavel')?.value ? parseInt(document.getElementById('aluno-responsavel').value, 10) : null
       };


       try {
           await api.alunos.criar(novo);
           formAluno.reset();
           setFeedback('feedback-aluno', 'Aluno cadastrado com sucesso!');
           carregarAlunos();
       } catch (err) {
           setFeedback('feedback-aluno', 'Erro: ' + err.message, true);
       }
   });
}


// ==========================================
// 5. AUTENTICAÇÃO (LOGIN ÚNICO)
// ==========================================
const formLogin = document.getElementById('form-login');
if (formLogin) {
   formLogin.addEventListener('submit', async (e) => {
       e.preventDefault();
       const credenciais = {
           email: document.getElementById('login-email').value,
           senha: document.getElementById('login-senha').value
       };


       try {
           const usuario = await api.login(credenciais);
           localStorage.setItem('usuario', JSON.stringify(usuario));
          
           // Redirecionamento sem alertas pop-up
           if (usuario.role === 'professor') {
               window.location.href = 'turmas.html';
           } else {
               window.location.href = 'index.html';
           }
       } catch (err) {
           setFeedback('feedback-login', 'Credenciais inválidas ou erro no servidor.', true);
       }
   });
}


// ==========================================
// INICIALIZAÇÃO AUTOMÁTICA DA PÁGINA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
   carregarProfessores();
   carregarResponsaveis();
   carregarTurmas();
   carregarAlunos();
});



