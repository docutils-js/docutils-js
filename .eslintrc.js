module.exports = {
  env: {
    browser: true,
      es6: true,
      jest: true,
  },
    extends: ['plugin:@typescript-eslint/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
    "parser": "@typescript-eslint/parser",
  rules: {
  },
};
