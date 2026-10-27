// Variáveis Globais de Estado de Acessibilidade
window.currentFontScale = 1.0;
window.currentBrightness = 100;
window.currentSaturation = 100;
window.isHighContrast = false;

document.addEventListener('DOMContentLoaded', () => {
  window.loadSettings();
});

window.loadSettings = function() {
  const saved = localStorage.getItem('tech_accessibility_settings');
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      window.currentFontScale = settings.fontScale || 1.0;
      window.currentBrightness = settings.brightness || 100;
      window.currentSaturation = settings.saturation || 100;
      window.isHighContrast = settings.highContrast || false;
    } catch (e) {
      console.error('Erro ao ler configurações:', e);
    }
  }
  window.applyAllSettings();
  window.syncUI();
};

window.applyAllSettings = function() {
  document.documentElement.style.setProperty('--font-scale-factor', window.currentFontScale);
  document.documentElement.style.setProperty('--page-brightness', window.currentBrightness + '%');
  document.documentElement.style.setProperty('--page-saturation', window.currentSaturation + '%');

  if (window.isHighContrast) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
};

window.syncUI = function() {
  const fontLabel = document.getElementById('font-size-label');
  if (fontLabel) fontLabel.innerText = Math.round(window.currentFontScale * 100) + '%';

  const bLabel = document.getElementById('brightness-label');
  if (bLabel) bLabel.innerText = window.currentBrightness + '%';
  const bRange = document.getElementById('brightness-range');
  if (bRange) bRange.value = window.currentBrightness;

  const sLabel = document.getElementById('saturation-label');
  if (sLabel) sLabel.innerText = window.currentSaturation + '%';
  const sRange = document.getElementById('saturation-range');
  if (sRange) sRange.value = window.currentSaturation;

  const contrastCheck = document.getElementById('toggle-contrast');
  if (contrastCheck) contrastCheck.checked = window.isHighContrast;
};

window.saveSettings = function() {
  const settings = {
    fontScale: window.currentFontScale,
    brightness: window.currentBrightness,
    saturation: window.currentSaturation,
    highContrast: window.isHighContrast
  };
  localStorage.setItem('tech_accessibility_settings', JSON.stringify(settings));
};

window.changeFontSize = function(delta) {
  window.currentFontScale = parseFloat((Math.min(Math.max(window.currentFontScale + delta, 0.8), 2.0)).toFixed(1));
  window.applyAllSettings();
  window.syncUI();
  window.saveSettings();
};

window.resetFontSize = function() {
  window.currentFontScale = 1.0;
  window.applyAllSettings();
  window.syncUI();
  window.saveSettings();
};

window.updateBrightness = function(val) {
  window.currentBrightness = val;
  window.applyAllSettings();
  window.syncUI();
  window.saveSettings();
};

window.updateSaturation = function(val) {
  window.currentSaturation = val;
  window.applyAllSettings();
  window.syncUI();
  window.saveSettings();
};

window.toggleHighContrast = function(enabled) {
  window.isHighContrast = Boolean(enabled);
  window.applyAllSettings();
  window.syncUI();
  window.saveSettings();
};

window.resetAllSettings = function() {
  window.currentFontScale = 1.0;
  window.currentBrightness = 100;
  window.currentSaturation = 100;
  window.isHighContrast = false;
  window.applyAllSettings();
  window.syncUI();
  window.saveSettings();
};

// Função para abrir e fechar a gaveta (Drawer)
window.toggleSettingsDrawer = function(open) {
  const drawer = document.getElementById('settings-drawer');
  const overlay = document.getElementById('settings-overlay');
  if (!drawer || !overlay) return;

  if (open) {
    overlay.classList.remove('hidden');
    drawer.classList.remove('hidden');
    setTimeout(() => {
      overlay.classList.add('open');
      drawer.classList.add('open');
    }, 10);
  } else {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    setTimeout(() => {
      overlay.classList.add('hidden');
      drawer.classList.add('hidden');
    }, 300);
  }
};