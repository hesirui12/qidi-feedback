document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

function loadSettings() {
  chrome.storage.sync.get(['enabled'], (result) => {
    document.getElementById('enabledToggle').checked = result.enabled !== false;
  });
}

function setupEventListeners() {
  document.getElementById('enabledToggle').addEventListener('change', (e) => {
    chrome.storage.sync.set({ enabled: e.target.checked });
  });
  
  document.getElementById('optionsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}
