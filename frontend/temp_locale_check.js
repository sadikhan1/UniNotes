import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const srcPath = path.join(__dirname, 'src');
const regex = /t\(["']([^"']+)["']\)/g;

// Get all .jsx files and .js files (excluding locale files)
function getAllFiles(dir, ext) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, ext));
    } else if (fullPath.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Extract used translation keys from JSX and JS files
const used = new Set();

const jsxFiles = getAllFiles(srcPath, '.jsx');
jsxFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    used.add(match[1]);
  }
});

const jsFiles = getAllFiles(srcPath, '.js')
  .filter(file => !file.endsWith('en.js') && !file.endsWith('tr.js'));
jsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    used.add(match[1]);
  }
});

// Extract defined keys from locale files
function loadLocaleKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keyRegex = /^\s*([A-Za-z0-9_]+):/gm;
  const keys = new Set();
  let match;
  
  while ((match = keyRegex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  
  return keys;
}

const enPath = path.join(srcPath, 'locales', 'en.js');
const trPath = path.join(srcPath, 'locales', 'tr.js');

const enKeys = loadLocaleKeys(enPath);
const trKeys = loadLocaleKeys(trPath);

// Find missing keys
const missingEn = Array.from(used).filter(key => !enKeys.has(key)).sort();
const missingTr = Array.from(used).filter(key => !trKeys.has(key)).sort();

console.log('used count:', used.size);
console.log('missing in en:', missingEn.length, missingEn);
console.log('missing in tr:', missingTr.length, missingTr);
