import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use FlatCompat to consume legacy ESLint configs (like eslint-config-next)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

const config = [
  // Ignore build artifacts and vendor directories
  { ignores: ['**/node_modules/**', '.next/**', 'out/**', 'dist/**'] },
  // Next.js core-web-vitals rules
  ...compat.extends('next/core-web-vitals'),
];

export default config;
