import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '.github/**/*',
      '**/.github/**/*',
      '**/*.yml',
      '**/*.yaml',
      'app/generated/**/*',
      'node_modules/**/*',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.extends('prettier'),
  ...compat.plugins('prettier'),
  {
    rules: {
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default eslintConfig;
