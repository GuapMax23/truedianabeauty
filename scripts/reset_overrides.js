import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const overridesPath = path.join(rootDir, 'src', 'data', 'productOverrides.ts');

const initialContent = `import type { Product } from '@/contexts/CartContext';

export interface ProductOverride extends Partial<Product> {
  price?: number;
}

/**
 * Surcharge facultative pour personnaliser les informations produits.
 * - La clé correspond à l'ID généré automatiquement (\`homme-1\`, \`femme-3\`, etc.)
 * - Remplissez uniquement les champs que vous souhaitez remplacer.
 */
export const productOverrides: Record<string, ProductOverride> = {
/*PRODUCT_DATA*/
{}
/*END_PRODUCT_DATA*/
};
`;

try {
    fs.writeFileSync(overridesPath, initialContent, 'utf-8');
    console.log('Successfully reset productOverrides.ts');
} catch (err) {
    console.error('Error writing file:', err);
}
