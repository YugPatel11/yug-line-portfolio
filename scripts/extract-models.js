import fs from 'fs';
import path from 'path';

const srcBase = path.resolve('public/models/Models/OBJ format');
const targetDir = path.resolve('public/models');

if (fs.existsSync(srcBase)) {
  const files = [
    'train-electric-subway-a.obj',
    'train-electric-subway-b.obj',
    'train-electric-subway-c.obj',
    'track-single.obj',
  ];
  for (const f of files) {
    fs.copyFileSync(path.join(srcBase, f), path.join(targetDir, f));
    console.log('Copied:', f);
  }
  const tex = path.join(srcBase, 'Textures/colormap.png');
  if (fs.existsSync(tex)) {
    fs.copyFileSync(tex, path.join(targetDir, 'colormap.png'));
    console.log('Copied colormap.png');
  }
  // Remove the nested Models folder
  fs.rmSync(path.join(targetDir, 'Models'), { recursive: true, force: true });
}
console.log('Organized public/models cleanly');
