import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('review');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 1. Capture Welcome Screen in fresh incognito mode with WebGL enabled
const welcomeImg = path.join(outDir, 'verify-welcome-3d.png');
try {
  execFileSync(chromePath, [
    '--headless=new',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--incognito',
    '--no-sandbox',
    '--virtual-time-budget=4000',
    `--screenshot=${welcomeImg}`,
    '--window-size=1440,900',
    'http://localhost:4321/'
  ]);
  console.log('✓ Captured Welcome:', welcomeImg);
} catch (e) {
  console.error('Welcome error:', e.message);
}
