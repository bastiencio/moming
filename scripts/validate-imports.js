#!/usr/bin/env node

/**
 * Import Path Validator
 * Ensures all imports use @/ alias instead of relative paths
 * Run: node scripts/validate-imports.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '../src');

let relativeImportCount = 0;
const files = [];

function walkDir(dir) {
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.')) {
      walkDir(fullPath);
    } else if ((item.endsWith('.ts') || item.endsWith('.tsx')) && !item.startsWith('.')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const matches = content.match(/from ['"]\.\.?\//g);

      if (matches) {
        files.push({
          file: fullPath.replace(srcDir, 'src'),
          count: matches.length,
        });
        relativeImportCount += matches.length;
      }
    }
  });
}

console.log('🔍 Validating Import Paths...\n');

walkDir(srcDir);

if (relativeImportCount === 0) {
  console.log('✅ All imports use @/ alias correctly!\n');
  process.exit(0);
} else {
  console.log(`⚠️  Found ${relativeImportCount} relative imports:\n`);
  files.forEach((f) => {
    console.log(`  ${f.file}: ${f.count} import(s)`);
  });
  console.log('\n💡 Tip: Use @/ alias for absolute imports');
  process.exit(1);
}
