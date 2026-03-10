// Reads src/index.html, injects the sync script, writes to public/index.html
const fs = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, 'src', 'index.html');
const DEST = path.join(__dirname, 'public', 'index.html');

const INJECTION = `<script>
(function() {
  // 1. Load data from server into localStorage before the app starts (sync XHR)
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/storage', false);
    xhr.send();
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      Object.entries(data).forEach(([k, v]) => {
        try { localStorage.setItem(k, v); } catch(e) {}
      });
    }
  } catch(e) { console.warn('[StudyOS] Could not load from server:', e); }

  // 2. Auto-save every 4 seconds
  function syncToServer() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      data[k] = localStorage.getItem(k);
    }
    fetch('/api/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {});
  }
  setInterval(syncToServer, 4000);

  // 3. Save on tab close
  window.addEventListener('beforeunload', syncToServer);
  console.log('[StudyOS] Cloud sync active ✓');
})();
</script>`;

fs.mkdirSync(path.dirname(DEST), { recursive: true });
let html = fs.readFileSync(SRC, 'utf8');
html = html.replace('<body>', '<body>' + INJECTION);
fs.writeFileSync(DEST, html, 'utf8');
console.log('[inject] public/index.html ready');
