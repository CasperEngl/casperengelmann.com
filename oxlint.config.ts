import { defineConfig } from 'oxlint'

export default defineConfig({
  plugins: ['eslint', 'typescript', 'unicorn', 'import'],
  jsPlugins: [
    { name: 'casperengl', specifier: '@casperengl/oxlint-rules' },
    { name: 'eslint-js', specifier: 'oxlint-plugin-eslint' },
  ],
  ignorePatterns: ['.astro/**', 'dist/**', 'node_modules/**', '**/*.d.ts'],
  rules: {
    'typescript/no-explicit-any': 'error',
    'typescript/no-non-null-assertion': 'error',
    'typescript/ban-ts-comment': 'error',
    'import/no-default-export': 'error',
    'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    'eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'eslint/no-console': ['error', { allow: ['warn', 'error'] }],
    'casperengl/no-redundant-component-wrapper': 'error',
    'casperengl/prefer-effect-fn': 'error',
    'eslint-js/no-restricted-syntax': [
      'error',
      {
        selector:
          ":matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)[returnType][returnType.typeAnnotation.type!='TSTypePredicate']",
        message:
          'Explicit function return types are not allowed; let TypeScript infer them. Type predicates are allowed.',
      },
      {
        selector:
          "VariableDeclaration[kind='const'] > VariableDeclarator[id.typeAnnotation]",
        message:
          'Type annotations are not allowed on const declarations; use inference or satisfies.',
      },
      {
        selector: "TSAsExpression:not([typeAnnotation.typeName.name='const'])",
        message:
          'Type assertions are not allowed. Validate the value or use satisfies. as const is allowed.',
      },
      {
        selector: 'TSTypeAssertion',
        message:
          'Angle-bracket type assertions are not allowed. Validate the value or fix its source type.',
      },
      {
        selector: 'SwitchStatement',
        message:
          'Switch statements are not allowed. Use a key map, matching utility, or guard clauses.',
      },
      {
        selector: 'IfStatement > BlockStatement.alternate IfStatement',
        message:
          'Do not nest an if statement directly inside an else branch. Use else if or a guard clause.',
      },
    ],
  },
  overrides: [
    {
      // Astro config and emdash plugin entrypoints require default exports.
      files: [
        '*.config.{js,mjs,ts}',
        'astro.config.mjs',
        'src/emdash/*/index.ts',
        'src/emdash/email/resend.ts',
      ],
      rules: { 'import/no-default-export': 'off' },
    },
    {
      // One-off CLI scripts report progress on stdout.
      files: ['scripts/**'],
      rules: {
        'eslint/no-console': 'off',
        'eslint-js/no-restricted-syntax': 'off',
      },
    },
  ],
})
