import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const overridesPath = path.join(rootDir, 'src', 'data', 'productOverrides.ts');

const testData = {
    id: 'skincare-test-id',
    name: "Test ' Name with Quotes",
    price: 19.99,
    description: "Test description with backslash \\ and single quote ' and double \" quote."
};

async function verify() {
    console.log('--- Verification Step 1: Sending Save Request ---');
    try {
        const response = await fetch('http://localhost:3001/api/save-product-override', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        console.log('Response:', result);

        console.log('\n--- Verification Step 2: Checking File Content ---');
        const content = fs.readFileSync(overridesPath, 'utf-8');
        console.log('File Content excerpt:\n', content.substring(content.indexOf('productOverrides:')));

        console.log('\n--- Verification Step 3: Sending Second Save Request (Check for Double Escaping) ---');
        const response2 = await fetch('http://localhost:3001/api/save-product-override', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        const result2 = await response2.json();
        console.log('Response 2:', result2);

        const content2 = fs.readFileSync(overridesPath, 'utf-8');
        console.log('\nFile Content after second save:\n', content2.substring(content2.indexOf('productOverrides:')));

    } catch (err) {
        console.error('Error during verification:', err);
    }
}

verify();
