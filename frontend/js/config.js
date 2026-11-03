// =========================================================
// GERENCIADOR GLOBAL DE ACESSIBILIDADE - TECHADVISORS
// =========================================================

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
  document.documentElement.style.fontSize = (window.currentFontScale * 100) + '%';
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

  const contrastCheck = document.getElementById('high-contrast-toggle') || document.getElementById('toggle-contrast');
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

window.setFontSizeNormal = function() {
  window.currentFontScale = 1.0;
  window.applyAllSettings();
  window.syncUI();
  window.saveSettings();
};

window.resetFontSize = window.setFontSizeNormal;

window.updateBrightness = function(val) {
  window.currentBrightness = parseInt(val);
  window.applyAllSettings();
  window.syncUI();
  window.saveSettings();
};

window.updateSaturation = function(val) {
  window.currentSaturation = parseInt(val);
  window.applyAllSettings();
  window.syncUI();
  window.saveSettings();
};

window.toggleHighContrast = function(enabledOrEvent) {
  if (typeof enabledOrEvent === 'boolean') {
    window.isHighContrast = enabledOrEvent;
  } else if (enabledOrEvent && enabledOrEvent.target) {
    window.isHighContrast = enabledOrEvent.target.checked;
  } else {
    window.isHighContrast = !window.isHighContrast;
  }
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

window.toggleSettingsDrawer = function(open) {
  const drawer = document.getElementById('settings-drawer');
  const overlay = document.getElementById('settings-overlay');
  if (!drawer || !overlay) return;

  if (open) {
    overlay.classList.remove('hidden-drawer');
    overlay.classList.add('visible-drawer');
    drawer.classList.remove('hidden-drawer');
    drawer.classList.add('visible-drawer');
  } else {
    overlay.classList.remove('visible-drawer');
    overlay.classList.add('hidden-drawer');
    drawer.classList.remove('visible-drawer');
    drawer.classList.add('hidden-drawer');
  }
};