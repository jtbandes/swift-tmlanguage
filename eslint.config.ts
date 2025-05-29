import foxglove from "@foxglove/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [".pnp.*", ".yarn"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
  foxglove.configs.base,
  foxglove.configs.typescript,
  {
    rules: {
      "no-warning-comments": "off",

      // prettier plugin currently produces some pnp-related import error
      "prettier/prettier": "off",
    },
    settings: {
      "import/external-module-folders": [".yarn"],
    },
  },
);
