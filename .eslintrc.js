module.exports = {
  env: {
    browser: true,
    es6: true,
	  jest: true
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
    rules: {
	"indent": ["off"],
	"class-methods-use-this": ["off"],
	"prefer-destructuring": ["off"],
	"no-param-reassign":["off"],
	"new-cap": ["off"],
	"no-underscore-dangle": ["off"],
	"no-unused-vars": ["warn"],
	"camelcase": ["warn"],
	"no-tabs": ["warn"],
	"no-mixed-spaces-and-tabs": ["warn"],
  },
};
