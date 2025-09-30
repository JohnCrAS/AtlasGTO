import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["src/components/map/layers/**/*.ts", "src/components/map/layers/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // Allow any types in layer files for now
      "@typescript-eslint/no-unused-vars": "warn", // Allow unused vars in layer files
    },
  },
];

export default eslintConfig;
