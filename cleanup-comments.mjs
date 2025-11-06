#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const removeConsoleStatements = (content) => {
  const lines = content.split('\n');
  const result = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip complete console.* lines
    if (trimmed.startsWith('console.log') ||
        trimmed.startsWith('console.error') ||
        trimmed.startsWith('console.warn') ||
        trimmed.startsWith('console.debug')) {
      continue;
    }
    
    // Skip TODO/FIXME/HACK comments (complete lines)
    if (trimmed.startsWith('//') && (trimmed.includes('TODO') || trimmed.includes('FIXME') || trimmed.includes('HACK') || trimmed.includes('DEBUG') || trimmed.includes('NOTE'))) {
      continue;
    }
    
    result.push(line);
  }
  
  return result.join('\n');
};

const files = globSync('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
let totalRemoved = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const cleaned = removeConsoleStatements(content);

  if (content !== cleaned) {
    fs.writeFileSync(file, cleaned, 'utf-8');
    const removed = (content.split('\n').length - cleaned.split('\n').length);
    totalRemoved += removed;
    console.log(`✓ ${file} (removed ${removed} lines)`);
  }
}

console.log(`\n✅ Removed ${totalRemoved} total lines with console statements and comments`);
