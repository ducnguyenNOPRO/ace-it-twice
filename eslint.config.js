import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: {
      react: pluginReact, // register the React plugin properly
    },
    extends: [
      js.configs.recommended, // fix: use js.configs.recommended instead of "js/recommended"
      pluginReact.configs.flat.recommended, // include React flat config
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off", // disable this rule safely
      "react/prop-types": "off",
      "react/display-name": "off"
    },
    settings: {
      react: {
        version: "detect", // auto-detect React version
      },
    },
  },
]);
