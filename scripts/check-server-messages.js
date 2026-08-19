/**
 * Server xabar kodlari tarjima qilinganmi.
 *
 * Server `_code` qaytaradi, mijoz uni `serverMessages` dan chizadi.
 * Kod qo'shilib, tarjimasi unutilsa foydalanuvchi zaxira sifatida
 * serverdagi o'zbekcha matnni ko'radi — ya'ni xato jimgina o'tib
 * ketadi va faqat rus tilidagi foydalanuvchi buni sezadi.
 *
 * Shuning uchun bu skript ikki ro'yxatni solishtiradi:
 *   `api/utils/messages.ts` dagi katalog  ↔  `ui/messages/*.json`
 *
 * `predev` va `prebuild` da yuritiladi.
 */

const { readFileSync, existsSync } = require('node:fs');
const { join, resolve } = require('node:path');

const uiRoot = resolve(__dirname, '..');
const catalogPath = resolve(uiRoot, '..', 'api', 'utils', 'messages.ts');

if (!existsSync(catalogPath)) {
  // `ui` alohida ham yig'ilishi mumkin — bu holat xato emas.
  console.warn('check-server-messages: api/ topilmadi, o\'tkazib yuborildi');
  process.exit(0);
}

/** Katalogdagi kodlar — `MESSAGE_CODES` massividagi satrlar. */
const source = readFileSync(catalogPath, 'utf8');
const block = source.slice(
  source.indexOf('MESSAGE_CODES = ['),
  source.indexOf('] as const;'),
);
const codes = [...block.matchAll(/'([A-Z][A-Z_]*)'/g)].map((match) => match[1]);

if (codes.length === 0) {
  console.error('check-server-messages: katalog bo\'sh ko\'rinadi');
  process.exit(1);
}

const LOCALES = ['uz', 'ru', 'en'];
const problems = [];

for (const locale of LOCALES) {
  const messages = JSON.parse(readFileSync(join(uiRoot, 'messages', `${locale}.json`), 'utf8'));
  const translations = messages.serverMessages ?? {};

  for (const code of codes) {
    if (!translations[code]) problems.push(`${locale}: "${code}" tarjimasi yo'q`);
  }

  // Ortiqcha kalit ham muammo: kod o'chirilgan, tarjima qolgan.
  for (const key of Object.keys(translations)) {
    if (!codes.includes(key)) problems.push(`${locale}: "${key}" katalogda yo'q`);
  }
}

if (problems.length > 0) {
  console.error('check-server-messages: kodlar va tarjimalar mos kelmadi\n');
  for (const problem of problems.slice(0, 30)) console.error(`  - ${problem}`);
  if (problems.length > 30) console.error(`  … yana ${problems.length - 30} ta`);
  console.error('\napi/utils/messages.ts va ui/messages/*.json ni birga yangilang');
  process.exit(1);
}

console.log(`check-server-messages: ${codes.length} ta kod, uchala tilda ham tarjima qilingan`);
