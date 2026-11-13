import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('review');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Capture the 3D Welcome screen
const welcomeScreenshot = path.join(outDir, 'test-3d-welcome.png');
try {
  execFileSync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--virtual-time-budget=3000',
    `--screenshot=${welcomeScreenshot}`,
    '--window-size=1440,900',
    'http://localhost:4321/'
  ]);
  console.log('✓ Captured 3D Welcome Screen:', welcomeScreenshot);
} catch (e) {
  console.error('Failed to capture welcome screen:', e.message);
}

// Capture Station 00 with Ticket Counter (Parallax depth)
const counterScreenshot = path.join(outDir, 'test-ticket-counter.png');
try {
  execFileSync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--virtual-time-budget=3000',
    `--screenshot=${counterScreenshot}`,
    '--window-size=1440,900',
    'http://localhost:4321/#base'
  ]);
  console.log('✓ Captured Ticket Counter:', counterScreenshot);
} catch (e) {
  console.error('Failed to capture ticket counter:', e.message);
}

// Capture Terminus Station 07 with Commemorative Ticket Voucher
const terminusScreenshot = path.join(outDir, 'test-terminus-voucher.png');
try {
  execFileSync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--virtual-time-budget=3000',
    `--screenshot=${terminusScreenshot}`,
    '--window-size=1440,900',
    'http://localhost:4321/#contact'
  ]);
  console.log('✓ Captured Terminus Ticket Voucher:', terminusScreenshot);
} catch (e) {
  console.error('Failed to capture terminus voucher:', e.message);
}

console.log('All browser verification checks completed.');
