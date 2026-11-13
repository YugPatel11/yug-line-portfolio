import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('review');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const projectsImg = path.join(outDir, 'verify-projects-redesign.png');
try {
  execFileSync(chromePath, [
    '--headless=new',
    '--incognito',
    '--no-sandbox',
    '--virtual-time-budget=3000',
    `--screenshot=${projectsImg}`,
    '--window-size=1440,1200',
    'http://localhost:4321/#projects'
  ]);
  console.log('✓ Captured Projects Redesign:', projectsImg);
} catch (e) {
  console.error('Capture error:', e.message);
}
