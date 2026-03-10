// Copies src/index.html to public/index.html
const fs = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, 'src', 'index.html');
const DEST = path.join(__dirname, 'public', 'index.html');

fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.copyFileSync(SRC, DEST);
console.log('[inject] public/index.html ready');
