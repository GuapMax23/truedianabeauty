import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Fonction pour scanner récursivement un dossier
function scanDirectory(dir, basePath = '') {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.join(basePath, item.name).replace(/\\/g, '/');

    if (item.isDirectory()) {
      files.push(...scanDirectory(fullPath, relativePath));
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        files.push(relativePath);
      }
    }
  }

  return files;
}

// Scanner les dossiers dans public/images
const imagesDir = path.join(rootDir, 'public', 'images');
const parfumHomme = scanDirectory(path.join(imagesDir, 'Parfum Homme'), 'images/Parfum Homme');
const parfumFemme = scanDirectory(path.join(imagesDir, 'Parfum Femme'), 'images/Parfum Femme');
const skincare = scanDirectory(path.join(imagesDir, 'skincare'), 'images/skincare');

// Générer le fichier TypeScript
const output = `// Fichier généré automatiquement par scripts/generateImagePaths.js
// Ne pas modifier manuellement - régénérer avec: npm run generate-images

export const imagePaths = {
  'Parfum Homme': ${JSON.stringify(parfumHomme.sort(), null, 2)},
  'Parfum Femme': ${JSON.stringify(parfumFemme.sort(), null, 2)},
  'skincare': ${JSON.stringify(skincare.sort(), null, 2)},
};

export const getImageUrl = (relativePath: string): string => {
  // Les images sont servies depuis le dossier public (accessible via /images/...)
  return '/' + relativePath.replace(/\\\\/g, '/');
};
`;

// Écrire le fichier
const outputPath = path.join(rootDir, 'src', 'data', 'imagePaths.ts');
fs.writeFileSync(outputPath, output, 'utf-8');

console.log('✅ Fichier imagePaths.ts généré avec succès!');
console.log(`   - Parfum Homme: ${parfumHomme.length} images`);
console.log(`   - Parfum Femme: ${parfumFemme.length} images`);
console.log(`   - Skincare: ${skincare.length} images`);
console.log(`   - Total: ${parfumHomme.length + parfumFemme.length + skincare.length} images`);


