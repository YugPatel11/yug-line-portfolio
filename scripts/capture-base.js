import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('review');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const baseDesktop = path.join(outDir, 'current-base-desktop.png');
const baseMobile = path.join(outDir, 'current-base-mobile.png');

try {
  execFileSync(chromePath, [
    '--headless=new',
    '--incognito',
    '--no-sandbox',
    '--virtual-time-budget=3000',
    `--screenshot=${baseDesktop}`,
    '--window-size=1440,1200',
    'http://localhost:4321/#base'
  ]);
  console.log('✓ Captured Base Desktop:', baseDesktop);

  execFileSync(chromePath, [
    '--headless=new',
    '--incognito',
    '--no-sandbox',
    '--virtual-time-budget=3000',
    `--screenshot=${baseMobile}`,
    '--window-size=390,900',
    'http://localhost:4321/#base'
  ]);
  console.log('✓ Captured Base Mobile:', baseMobile);
} catch (e) {
  console.error('Capture error:', e.message);
}
