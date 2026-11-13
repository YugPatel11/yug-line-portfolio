import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('review');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const achievementsImg = path.join(outDir, 'upgraded-achievements.png');
const experienceImg = path.join(outDir, 'upgraded-experience.png');

try {
  execFileSync(chromePath, [
    '--headless=new',
    '--incognito',
    '--no-sandbox',
    '--virtual-time-budget=3000',
    `--screenshot=${achievementsImg}`,
    '--window-size=1440,1350',
    'http://localhost:4321/#board'
  ]);
  console.log('✓ Captured Upgraded Achievements:', achievementsImg);

  execFileSync(chromePath, [
    '--headless=new',
    '--incognito',
    '--no-sandbox',
    '--virtual-time-budget=3000',
    `--screenshot=${experienceImg}`,
    '--window-size=1440,1350',
    'http://localhost:4321/#crew'
  ]);
  console.log('✓ Captured Upgraded Experience:', experienceImg);
} catch (e) {
  console.error('Capture error:', e.message);
}
