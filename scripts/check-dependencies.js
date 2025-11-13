#!/usr/bin/env node

/**
 * Dependency Checker
 * Identifies unused dependencies and potential optimizations
 * Run: node scripts/check-dependencies.js
 */

import fs from 'fs';
import path from 'path';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

console.log('📊 Project Dependencies Analysis\n');
console.log('==================================\n');

// Count dependencies
const prodDeps = Object.keys(packageJson.dependencies || {});
const devDeps = Object.keys(packageJson.devDependencies || {});

console.log(`Production Dependencies: ${prodDeps.length}`);
console.log(`Development Dependencies: ${devDeps.length}`);
console.log(`Total: ${prodDeps.length + devDeps.length}\n`);

// Highlight large dependencies that might be worth optimizing
const largeDeps = [
  'recharts',
  'framer-motion',
  'html2canvas',
  'jspdf',
  'dompurify',
];

const usedLargeDeps = largeDeps.filter((dep) => prodDeps.includes(dep));

if (usedLargeDeps.length > 0) {
  console.log('Large Dependencies (consider lazy loading):');
  usedLargeDeps.forEach((dep) => {
    console.log(`  • ${dep}`);
  });
  console.log('');
}

// Suggest unused dependencies
const unusedDeps = ['crypto', 'bcryptjs', 'express'];
const actuallyUsed = unusedDeps.filter((dep) => prodDeps.includes(dep));

if (actuallyUsed.length > 0) {
  console.log('Potentially Unused Dependencies (client-side):');
  actuallyUsed.forEach((dep) => {
    console.log(`  • ${dep} (used for server-side, remove if not needed)`);
  });
  console.log('');
}

console.log('💡 Tips for optimization:');
console.log('  1. Code split large feature modules');
console.log('  2. Lazy load charts and PDF generation');
console.log('  3. Remove server-side libraries from client code');
console.log('  4. Use tree-shaking for unused exports');
