module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:unicorn/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'linebreak-style': ['error', 'unix'],
    semi: ['error', 'never'],
    'unicorn/prevent-abbreviations': [
      'warn',
      {
        replacements: {
          refs: false,
          prop: false,
          props: false,
          args: false,
          ref: false,
          env: false,
        },
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.js'],
      rules: {
        'unicorn/prefer-module': 'off',
      },
    },
  ],
}
