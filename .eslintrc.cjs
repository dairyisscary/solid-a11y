const useExpensiveChecks = Boolean(process.env.USE_EXPENSIVE_LINT_RULES);
const projectGlobs = "./packages/*/tsconfig{.test.json,.json}";

module.exports = {
  extends: ["eslint:recommended"],
  overrides: [
    // Node commonjs files
    {
      files: ["**/*.cjs"],
      env: { node: true },
    },
    // TS files
    {
      extends: [
        "plugin:@typescript-eslint/recommended",
        useExpensiveChecks && "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ].filter(Boolean),
      files: ["**/*.{ts,tsx}"],
      parserOptions: {
        project: useExpensiveChecks ? projectGlobs : undefined,
      },
      rules: {
        "no-undef": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    // Example files
    {
      files: ["**/*.example.{ts,tsx}"],
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
      },
    },
    // Test files
    {
      files: ["**/*.test.{ts,tsx}"],
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
      },
    },
  ],
  plugins: ["@typescript-eslint", "import"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      impliedStrict: true,
      jsx: true,
    },
  },
  rules: {
    "no-mixed-spaces-and-tabs": "off",
    "no-console": "error",
    eqeqeq: "error",
    "prefer-const": "error",
    "import/no-useless-path-segments": "error",
    "import/order": [
      "error",
      {
        alphabetize: { order: "asc" },
        groups: [["builtin", "external"], "internal"],
        "newlines-between": "always",
        pathGroups: [{ pattern: "@docs/**", group: "internal" }],
        pathGroupsExcludedImportTypes: [],
      },
    ],
    "sort-imports": ["error", { allowSeparatedGroups: true, ignoreDeclarationSort: true }],
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: projectGlobs,
      },
    },
  },
};
