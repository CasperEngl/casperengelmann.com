import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-config-prettier'
import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'

export default [
  {
    ignores: [
      '.astro/**',
      '.vscode/**',
      '**/*.d.ts',
      'dist/**',
      'node_modules/**',
    ],
  },
  js.configs.recommended,
  ...typescriptEslint.configs['flat/recommended'],
  prettier,
  {
    files: ['**/*.{cjs,js,mjs,ts,tsx}'],
    plugins: { unicorn },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'linebreak-style': ['error', 'unix'],
      semi: ['error', 'never'],
      'unicorn/name-replacements': [
        'warn',
        {
          replacements: {
            args: false,
            env: false,
            prop: false,
            props: false,
            ref: false,
            refs: false,
          },
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    rules: {
      'unicorn/prefer-module': 'off',
    },
  },
]
