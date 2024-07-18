const { join } = require('path');

module.exports = {
  parser: '@babel/eslint-parser',
  globals: {
    PRODUCTION: false,
    FileReader: false,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    babelOptions: {
      configFile: join(__dirname, '.babelrc'),
    },
  },
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  extends: ['./.eslintrc.base.js'],
};
