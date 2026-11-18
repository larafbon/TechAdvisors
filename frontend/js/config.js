(function () {
  const STORAGE_KEY = 'tech_a11y_settings';

  const DEFAULT_SETTINGS = {
    fontScale: 1,
    brightness: 100,
    saturation: 100,
    highContrast: false
  };

  function getSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {}
  }

  function ensureDrawerExists() {
    let overlay = document.getElementById('settings-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'settings-overlay';
      overlay.className = 'hidden-drawer';
      overlay.onclick = () => window.toggleSettingsDrawer(false);
      document.body.appendChild(overlay);
    }

    let drawer = document.getElementById('settings-drawer');
    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.id = 'settings-drawer';
      drawer.className = 'hidden-drawer';
      document.body.appendChild(drawer);
    }

    drawer.innerHTML = `
      <div class="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <h2 class="text-lg font-bold text-slate-800">Configurações & Acessibilidade</h2>
        <button type="button" onclick="toggleSettingsDrawer(false)" class="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer">✕</button>
      </div>

      <div class="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div class="flex justify-between items-center mb-2">
          <label class="text-xs font-semibold text-slate-700">Tamanho da Fonte</label>
          <span id="font-size-label" class="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">100%</span>
        </div>
        <div class="flex gap-2">
          <button type="button" onclick="changeFontSize(-0.1)" class="flex-1 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-bold text-slate-700 cursor-pointer">A -</button>
          <button type="button" onclick="resetFontSize()" class="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs text-slate-600 cursor-pointer">Normal</button>
          <button type="button" onclick="changeFontSize(0.1)" class="flex-1 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-bold text-slate-700 cursor-pointer">A +</button>
        </div>
      </div>

      <div class="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div class="flex justify-between items-center mb-1">
          <label for="brightness-range" class="text-xs font-semibold text-slate-700">Brilho da Tela</label>
          <span id="brightness-label" class="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">100%</span>
        </div>
        <input type="range" id="brightness-range" min="30" max="100" value="100" step="5" oninput="updateBrightness(this.value)" class="w-full accent-purple-700 cursor-pointer">
      </div>

      <div class="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div class="flex justify-between items-center mb-1">
          <label for="saturation-range" class="text-xs font-semibold text-slate-700">Saturação de Cores</label>
          <span id="saturation-label" class="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">100%</span>
        </div>
        <input type="range" id="saturation-range" min="0" max="150" value="100" step="5" oninput="updateSaturation(this.value)" class="w-full accent-purple-700 cursor-pointer">
      </div>

      <div class="mb-6 flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
        <span class="text-xs font-semibold text-slate-700">Modo Alto Contraste</span>
        <input type="checkbox" id="toggle-contrast" onchange="toggleHighContrast(this.checked)" class="w-4 h-4 accent-purple-700 cursor-pointer">
      </div>

      <button type="button" onclick="resetAllSettings()" class="w-full text-xs font-semibold text-slate-500 hover:text-purple-700 underline mt-auto text-center pt-4 cursor-pointer">Restaurar Padrões</button>
    `;

    const hasFloatingBtn = document.querySelector('button[onclick*="toggleSettingsDrawer"]');
    if (!hasFloatingBtn) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = 'Configurações e Acessibilidade';
      btn.onclick = () => window.toggleSettingsDrawer(true);
      btn.className = 'fixed bottom-6 right-6 z-40 bg-[#5b21b6] hover:bg-purple-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20 transition-all hover:scale-105 active:scale-95 text-xl cursor-pointer';
      btn.innerText = '⚙️';
      document.body.appendChild(btn);
    }
  }

  function applySettings(settings) {
    const root = document.documentElement;
    root.style.setProperty('--font-scale-factor', settings.fontScale);
    root.style.setProperty('--page-brightness', `${settings.brightness}%`);
    root.style.setProperty('--page-saturation', `${settings.saturation}%`);

    const fontLabel = document.getElementById('font-size-label');
    if (fontLabel) fontLabel.innerText = `${Math.round(settings.fontScale * 100)}%`;

    const brightRange = document.getElementById('brightness-range');
    const brightLabel = document.getElementById('brightness-label');
    if (brightRange) brightRange.value = settings.brightness;
    if (brightLabel) brightLabel.innerText = `${settings.brightness}%`;

    const satRange = document.getElementById('saturation-range');
    const satLabel = document.getElementById('saturation-label');
    if (satRange) satRange.value = settings.saturation;
    if (satLabel) satLabel.innerText = `${settings.saturation}%`;

    const contrastCheck = document.getElementById('toggle-contrast');
    if (contrastCheck) contrastCheck.checked = Boolean(settings.highContrast);
    document.body.classList.toggle('high-contrast', Boolean(settings.highContrast));
  }

  window.toggleSettingsDrawer = function (forceOpen) {
    ensureDrawerExists();
    const overlay = document.getElementById('settings-overlay');
    const drawer = document.getElementById('settings-drawer');
    if (!overlay || !drawer) return;

    const isCurrentlyHidden = drawer.classList.contains('hidden-drawer');
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : isCurrentlyHidden;

    if (shouldOpen) {
      overlay.classList.remove('hidden-drawer', 'hidden');
      overlay.classList.add('visible-drawer', 'active');
      drawer.classList.remove('hidden-drawer', 'hidden');
      drawer.classList.add('visible-drawer', 'active');
    } else {
      overlay.classList.remove('visible-drawer', 'active');
      overlay.classList.add('hidden-drawer');
      drawer.classList.remove('visible-drawer', 'active');
      drawer.classList.add('hidden-drawer');
    }
  };

  window.changeFontSize = function (delta) {
    const s = getSettings();
    s.fontScale = Math.min(1.4, Math.max(0.8, Number((s.fontScale + delta).toFixed(2))));
    saveSettings(s);
    applySettings(s);
  };

  window.resetFontSize = function () {
    const s = getSettings();
    s.fontScale = 1;
    saveSettings(s);
    applySettings(s);
  };

  window.updateBrightness = function (val) {
    const s = getSettings();
    s.brightness = Number(val);
    saveSettings(s);
    applySettings(s);
  };

  window.updateSaturation = function (val) {
    const s = getSettings();
    s.saturation = Number(val);
    saveSettings(s);
    applySettings(s);
  };

  window.toggleHighContrast = function (checked) {
    const s = getSettings();
    s.highContrast = Boolean(checked);
    saveSettings(s);
    applySettings(s);
  };

  window.resetAllSettings = function () {
    const s = { ...DEFAULT_SETTINGS };
    saveSettings(s);
    applySettings(s);
  };

  window.toggleUserMenu = function (event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('userMenu');
    if (menu) menu.classList.toggle('show');
  };

  window.logout = function () {
    localStorage.removeItem('tech_user');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  };

  document.addEventListener('click', () => {
    const menu = document.getElementById('userMenu');
    if (menu) menu.classList.remove('show');
  });

  document.addEventListener('DOMContentLoaded', () => {
    ensureDrawerExists();
    applySettings(getSettings());
  });
})();