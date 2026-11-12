import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
console.log('🔍 Running automated audit on build outputs in:', distDir);

let errors = 0;

function checkFile(relPath, requiredStrings = [], forbiddenStrings = []) {
  const fullPath = path.join(distDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Missing file: ${relPath}`);
    errors++;
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  for (const req of requiredStrings) {
    if (!content.includes(req)) {
      console.error(`❌ ${relPath} missing expected string: "${req}"`);
      errors++;
    }
  }

  for (const forb of forbiddenStrings) {
    if (content.includes(forb)) {
      console.error(`❌ ${relPath} contains forbidden string: "${forb}"`);
      errors++;
    }
  }

  console.log(`✓ ${relPath} verified successfully.`);
}

// 1. Verify index.html
const stations = [
  'station-00',
  'station-01',
  'station-02',
  'station-03',
  'station-04',
  'station-05',
  'station-06',
  'station-07',
];

checkFile(
  'index.html',
  [
    ...stations,
    'The Yug Line',
    'Yug Rojivadiya',
    'id="journey-announcer"',
    'id="day-pass-btn"',
    'id="travel-card-btn"',
    'id="motion-toggle"',
    'id="sound-toggle"',
  ],
  ['backdrop-blur', 'sample.html', 'TODO-USER']
);

// 2. Verify 404.html
checkFile('404.html', ['Train not found', 'STATION CLOSED', 'href="/"']);

// 3. Verify SEO files
checkFile('robots.txt', ['User-agent: *', 'Sitemap:']);
checkFile('sitemap.xml', ['https://yugpatel11.github.io/']);

if (errors > 0) {
  console.error(`\n❌ Audit failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log('\n✨ All automated verification checks passed!');
}
