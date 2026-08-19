import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    /**
     * Qo'lda yozilmagan fayllar.
     *
     * `types/input|models|output` — `api` dagi `yarn generate:types`
     * chiqaradi; ularni tuzatish keyingi generatsiyada yo'qoladi.
     *
     * `lib/geometry` — `api/geometry` dan nusxalanadi (`sync:geometry`).
     * U yerda o'z tekshiruvi bor: 194 ta test va `depcruise`.
     */
    "types/input/**",
    "types/models/**",
    "types/output/**",
    "lib/geometry/**",
  ]),

  {
    /**
     * `scripts/` — Node'da to'g'ridan-to'g'ri ishlaydigan CommonJS
     * fayllar (`npm run check:limits`). Ular brauzerga tushmaydi va
     * `require()` ular uchun to'g'ri shakl.
     */
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
