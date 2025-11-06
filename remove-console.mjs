#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const removeConsoleStatements = (content) => {
  // Remove console.log, console.error, console.warn, console.debug lines
  return content
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return !trimmed.startsWith('console.log') &&
             !trimmed.startsWith('console.error') &&
             !trimmed.startsWith('console.warn') &&
             !trimmed.startsWith('console.debug');
    })
    .join('\n')
    // Remove TODO, FIXME, HACK comments
    .replace(/\s*\/\/\s*(TODO|FIXME|HACK|DEBUG|NOTE)[^\n]*/g, '');
};

(async () => {
  const files = await glob('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
  let totalRemoved = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    const original = content;
    content = removeConsoleStatements(content);

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf-8');
      const removed = (original.match(/console\.(log|error|warn|debug)|\/\/\s*(TODO|FIXME|HACK)/g) || []).length;
      totalRemoved += removed;
      console.log(`✓ ${file} (removed ${removed} statements)`);
    }
  }

  console.log(`\n✅ Done! Removed ${totalRemoved} total console statements and comments`);
})();
