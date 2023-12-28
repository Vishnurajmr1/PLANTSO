module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: "eslint:recommended",
  plugins: ["node"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  globals: {
    process: true,
  },
  rules: {
    indent: ["error", 4],
    "linebreak-style": off,
    quotes: ["warn", "double"],
    semi: ["error", "always"],
    "no-underscore-dangle": ["error", { allow: ["__dirname"] }],
  },
};
