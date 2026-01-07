import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const overridesPath = path.join(rootDir, 'src', 'data', 'productOverrides.ts');

console.log('Cleaning file:', overridesPath);

try {
    let content = fs.readFileSync(overridesPath, 'utf-8');
    console.log('Original size:', content.length);

    // Replace sequences of 4 or more backslashes with nothing (or single backslash?)
    // The corruption adds \\\\ recursively.
    // Actually, we probably want to fix the specific descriptions.

    // A simple heuristic: replace any sequence of more than 4 backslashes with empty string or single space, 
    // because likely there shouldn't be backslashes in descriptions anyway.

    const cleaned = content.replace(/\\{4,}/g, '');

    console.log('Cleaned size:', cleaned.length);

    fs.writeFileSync(overridesPath, cleaned, 'utf-8');
    console.log('File saved.');

} catch (e) {
    console.error('Error:', e);
}
