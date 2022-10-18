module.exports = {
  env: {
    "es6": true,
    "node": true,
    "browser": true
  },
  extends: [
    "plugin:react/recommended",
    "standard-with-typescript",
    "plugin:prettier/recommended"
  ],
  ignorePatterns: [
    "**/build/**",
    "**/node_modules/**",
    ".eslintrc.js",
    "tsconfig.json",
    "package.json"
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "ecmaVersion": 2018,
    "sourceType": "module",
    "project": "tsconfig.json"
  },
  plugins: [
    "react", 
    "prettier",
    "@typescript-eslint"
  ],
  rules: {
    "@typescript-eslint/strict-boolean-expressions": 0,
    "prettier/prettier": "error"
  }
};
