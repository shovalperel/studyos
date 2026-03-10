// Watches C:\Users\Shoval\Downloads\index.html
// On every save → copies → injects → git commit + push → Netlify auto-deploys

const chokidar = require('chokidar');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cfg      = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const SRC      = path.join('C:\\', 'Users', 'Shoval', 'Downloads', 'index.html');
const SRC_DEST = path.join(__dirname, 'src', 'index.html');

function run(cmd) {
  execSync(cmd, { cwd: __dirname, stdio: 'inherit' });
}

function deploy() {
  const t = new Date().toLocaleTimeString();
  console.log(`\n[${t}] Change detected — building and pushing...`);
  try {
    fs.copyFileSync(SRC, SRC_DEST);
    run('node inject.js');
    run('git add src/index.html public/index.html');
    run(`git commit -m "Update HTML - ${new Date().toISOString()}"`);
    run(`git push https://${cfg.githubToken}@github.com/shovalperel/studyos.git main`);
    console.log(`[${new Date().toLocaleTimeString()}] ✓ Pushed to https://github.com/shovalperel/studyos`);
  } catch (e) {
    console.error('Failed:', e.message);
  }
}

chokidar.watch(SRC, {
  persistent: true,
  awaitWriteFinish: { stabilityThreshold: 600, pollInterval: 100 }
}).on('change', deploy);

console.log('[Watcher] Watching:', SRC);
console.log('[Watcher] Every save → auto-commits to https://github.com/shovalperel/studyos');
