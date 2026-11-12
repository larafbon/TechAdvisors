// Abrir/Fechar a gaveta de configurações
window.toggleSettingsDrawer = function(open) {
  const drawer = document.getElementById('settings-drawer');
  const overlay = document.getElementById('settings-overlay');

  if (!drawer || !overlay) return;

  if (open) {
    overlay.classList.remove('hidden-drawer', 'hidden');
    overlay.classList.add('visible-drawer');

    drawer.classList.remove('hidden-drawer', 'hidden');
    drawer.classList.add('visible-drawer');
  } else {
    overlay.classList.remove('visible-drawer');
    overlay.classList.add('hidden-drawer');

    drawer.classList.remove('visible-drawer');
    drawer.classList.add('hidden-drawer');
  }
};

// Toggle do Menu Dropdown do Usuário (Universal)
window.toggleUserMenu = function(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('userMenu');
  if (menu) {
    menu.classList.toggle('show');
    menu.classList.toggle('active');
  }
};

// Abrir Configurações pelo menu superior
window.openSettingsFromMenu = function(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('userMenu');
  if (menu) {
    menu.classList.remove('show', 'active');
  }
  window.toggleSettingsDrawer(true);
};

// Abrir Tela de Perfil
window.openPerfilPage = function(e) {
  if (e) e.stopPropagation();
  window.location.href = 'perfil.html';
};

// Fechar menu ao clicar fora dele
document.addEventListener('click', (e) => {
  const menu = document.getElementById('userMenu');
  const userContainer = document.querySelector('.user-menu-container');
  if (menu && userContainer && !userContainer.contains(e.target)) {
    menu.classList.remove('show', 'active');
  }
});

// Acessibilidade: Controle de Fonte
let currentFontScale = 1;
window.changeFontSize = function(delta) {
  currentFontScale = Math.min(Math.max(currentFontScale + delta, 0.8), 1.4);
  document.documentElement.style.fontSize = `${currentFontScale * 100}%`;
  const label = document.getElementById('font-size-label');
  if (label) label.innerText = `${Math.round(currentFontScale * 100)}%`;
};

window.resetFontSize = function() {
  currentFontScale = 1;
  document.documentElement.style.fontSize = '100%';
  const label = document.getElementById('font-size-label');
  if (label) label.innerText = '100%';
};

// Acessibilidade: Brilho e Saturação
window.updateBrightness = function(val) {
  document.body.style.filter = `brightness(${val}%)`;
  const label = document.getElementById('brightness-label');
  if (label) label.innerText = `${val}%`;
};

window.updateSaturation = function(val) {
  document.body.style.filter = `saturate(${val}%)`;
  const label = document.getElementById('saturation-label');
  if (label) label.innerText = `${val}%`;
};

window.toggleHighContrast = function(checked) {
  if (checked) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
};

window.resetAllSettings = function() {
  window.resetFontSize();
  window.updateBrightness(100);
  window.updateSaturation(100);
  window.toggleHighContrast(false);
  const bRange = document.getElementById('brightness-range');
  const sRange = document.getElementById('saturation-range');
  const cCheck = document.getElementById('toggle-contrast');
  if (bRange) bRange.value = 100;
  if (sRange) sRange.value = 100;
  if (cCheck) cCheck.checked = false;
};

window.logout = function() {
  localStorage.removeItem('tech_user');
  window.location.href = 'index.html';
};