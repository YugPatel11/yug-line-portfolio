import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('review');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Capture mobile view to ensure responsive quality
const mobileProjectsImg = path.join(outDir, 'verify-projects-mobile.png');
try {
  execFileSync(chromePath, [
    '--headless=new',
    '--incognito',
    '--no-sandbox',
    '--virtual-time-budget=2500',
    `--screenshot=${mobileProjectsImg}`,
    '--window-size=390,844',
    'http://localhost:4321/#projects'
  ]);
  console.log('✓ Captured Projects Mobile:', mobileProjectsImg);
} catch (e) {
  console.error('Mobile capture error:', e.message);
}
