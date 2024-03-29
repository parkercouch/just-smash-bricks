/* eslint-env node */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  root: true,
  overrides: [
    {
      files: ['*.js'],
      extends: ['plugin:@typescript-eslint/disable-type-checked'],
    },
  ],
  ignorePatterns: [
    'node_modules/',
    '**/node_modules/',
    '/**/node_modules/*',
    'dist/',
  ]
};
