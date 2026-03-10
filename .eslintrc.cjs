/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: { node: true, es2022: true, jest: true },
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  extends: ["eslint:recommended"],
  overrides: [
    { files: ["**/*.mjs", "**/*.js"], parserOptions: { sourceType: "module" } },
  ],
  ignorePatterns: ["node_modules/", "dist/", "models/", "*.pkl"],
  rules: {
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};
