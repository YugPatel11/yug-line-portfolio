import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const reviewDir = path.resolve('review');
if (!fs.existsSync(reviewDir)) fs.mkdirSync(reviewDir, { recursive: true });

const targets = [
  { name: 'audit-st00-base.png', url: 'http://localhost:4321/#base', size: '1440,900' },
  { name: 'audit-st01-achievements.png', url: 'http://localhost:4321/#board', size: '1440,900' },
  { name: 'audit-st02-ghumify.png', url: 'http://localhost:4321/#ghumify', size: '1440,900' },
  { name: 'audit-st03-projects.png', url: 'http://localhost:4321/#projects', size: '1440,900' },
  { name: 'audit-st04-crew.png', url: 'http://localhost:4321/#crew', size: '1440,900' },
  { name: 'audit-st05-skills.png', url: 'http://localhost:4321/#legend', size: '1440,900' },
  { name: 'audit-st06-education.png', url: 'http://localhost:4321/#education', size: '1440,900' },
  { name: 'audit-st07-contact.png', url: 'http://localhost:4321/#contact', size: '1440,900' },
  { name: 'audit-mobile-st00.png', url: 'http://localhost:4321/#base', size: '390,844' },
  { name: 'audit-mobile-st02.png', url: 'http://localhost:4321/#ghumify', size: '390,844' },
  { name: 'audit-mobile-st03.png', url: 'http://localhost:4321/#projects', size: '390,844' },
];

console.log('Capturing comprehensive audit screens...');
for (const target of targets) {
  const outPath = path.join(reviewDir, target.name);
  try {
    execFileSync(chromePath, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--virtual-time-budget=2000',
      `--screenshot=${outPath}`,
      `--window-size=${target.size}`,
      target.url
    ]);
    console.log(`✓ ${target.name}`);
  } catch (err) {
    console.error(`✗ ${target.name}:`, err.message);
  }
}
console.log('Finished capturing all audit screens.');
