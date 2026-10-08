import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import { execSync } from 'child_process';
const names = process.argv.slice(2);
execSync('npx esbuild entry.js --bundle --format=esm --outfile=bundle.js --log-level=error', { stdio: 'inherit' });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage();
p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() === 'error' || m.type()==='warning') console.log('LOG', m.text().slice(0,200)); });
await p.setContent('<html><body></body></html>');
await p.addScriptTag({ content: fs.readFileSync('bundle.js', 'utf8'), type: 'module' });
await p.waitForFunction(() => !!window.renderScene, null, { timeout: 60000 });
fs.mkdirSync('out', { recursive: true });
for (const n of names) {
  const t = Date.now();
  for (const mode of ['beauty', 'mask']) {
    const url = await p.evaluate(([n, mode]) => window.renderScene(n, mode, 1280, 800), [n, mode]);
    fs.writeFileSync(`out/${n}-${mode}.${mode === 'mask' ? 'png' : 'jpg'}`, Buffer.from(url.split(',')[1], 'base64'));
  }
  console.log(n, ((Date.now() - t) / 1000).toFixed(1) + 's');
}
await b.close();
