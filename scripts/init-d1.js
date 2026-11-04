import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const isRemote = process.argv.includes('--remote');
const flag = isRemote ? '--remote' : '--local';

const migrationsDir = path.resolve('migrations');
const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

console.log(`Executing ${files.length} migrations (${flag})...`);

for (const file of files) {
  const filePath = path.join('migrations', file);
  console.log(`\n=== Running ${filePath} ===`);
  execSync(`npx wrangler d1 execute DB ${flag} -y --file=./${filePath}`, { stdio: 'inherit' });
}

console.log('\nAll migrations completed successfully!');
