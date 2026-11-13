import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('review');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 1. Capture Welcome Screen (3D 2-Car Subway Consist)
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

// 2. Capture Cinematic Boarding Scene via ?cinematic=projects
const cinematicImg = path.join(outDir, 'verify-cinematic-departure.png');
try {
  execFileSync(chromePath, [
    '--headless=new',
    '--incognito',
    '--no-sandbox',
    '--virtual-time-budget=3500',
    `--screenshot=${cinematicImg}`,
    '--window-size=1440,900',
    'http://localhost:4321/?cinematic=projects'
  ]);
  console.log('✓ Captured Cinematic Departure:', cinematicImg);
} catch (e) {
  console.error('Cinematic error:', e.message);
}
