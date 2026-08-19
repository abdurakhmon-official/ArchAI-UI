/**
 * Tarjima fayllarini solishtiradi.
 *
 * Uchta fayl bor va ular qo'lda tahrirlanadi. Kalit yetishmasa
 * `next-intl` sahifada xom kalitni chizadi (`constructor.preview.title`),
 * xatolik esa faqat konsolga tushadi — ya'ni nosozlik jimgina yashaydi.
 *
 * Ikkinchi tekshiruv nozikroq: kalit BOR, lekin qiymati o'zbekchadan
 * nusxa. Bu paritetdan o'tadi, lekin rus foydalanuvchi o'zbekcha matn
 * ko'radi. Aynan shu holat Faza 7 dan keyin sezilmay qolgan edi.
 *
 *   node scripts/check-messages.js
 */

const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const DIR = join(__dirname, '..', 'messages');
const BASE = 'uz';
const OTHERS = ['ru', 'en'];

/**
 * Tarjimasi shart bo'lmagan bo'limlar.
 *
 * `admin` — kelishilgan qaror: admin paneli faqat o'zbekcha. Qolganlari
 * uchala tilda ham bir xil bo'lishi TABIIY: brend nomi va "Email" so'zi
 * tarjima qilinmaydi.
 */
const SKIP_PREFIXES = ['admin.'];

/**
 * Uchala tilda bir xil bo'lishi TO'G'RI bo'lgan kalitlar.
 *
 * Bular e'tibordan qolgan tarjima emas: brend nomi va shiori
 * o'zgarmaydi, "Email", "Blog", "Sauna", "Material" uchta tilda ham bir
 * xil yoziladi, "sotix" esa mahalliy o'lchov birligi va tarjimasi yo'q.
 *
 * Ro'yxat ATAYLAB aniq: yangi kalit qo'shilib, tarjimasi unutilsa
 * tekshiruv uni ushlaydi. Bu yerga qo'shish — ongli qaror.
 */
const SKIP_KEYS = new Set([
  'brand.name',
  'brand.tagline',
  'auth.email',
  // «Email» uchala tilda ham bir xil yoziladi.
  'auth.reset.email',
  'account.email',
  'common.sum',
  'nav.blog',
  // «Admin panel» inglizcha va o'zbekchada bir xil yoziladi.
  'nav.adminPanel',
  'blog.title',
  'constructor.fields.landAreaUnit',
  'constructor.extras.sauna',
  'estimate.material',
]);

function flatten(value, prefix = '') {
  return Object.entries(value).flatMap(([key, item]) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? flatten(item, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

const read = (locale) => JSON.parse(readFileSync(join(DIR, `${locale}.json`), 'utf8'));
const at = (object, path) => path.split('.').reduce((node, key) => node?.[key], object);

const base = read(BASE);
const baseKeys = flatten(base);
const problems = [];

if (baseKeys.length === 0) {
  problems.push(`${BASE}.json bo'sh — tekshiruv eskirgan`);
}

for (const locale of OTHERS) {
  const other = read(locale);
  const otherKeys = new Set(flatten(other));

  for (const key of baseKeys) {
    if (!otherKeys.has(key)) problems.push(`${locale}: "${key}" yetishmaydi`);
  }

  for (const key of otherKeys) {
    if (!baseKeys.includes(key)) problems.push(`${locale}: "${key}" ortiqcha`);
  }

  // Tarjima qilinmagan qiymatlar.
  const untranslated = baseKeys.filter((key) => {
    if (SKIP_PREFIXES.some((prefix) => key.startsWith(prefix)) || SKIP_KEYS.has(key)) return false;

    const source = at(base, key);
    const target = at(other, key);

    // Qisqa qiymatlar ("m²", "OK") tabiiy ravishda bir xil bo'lishi mumkin.
    return typeof source === 'string' && source === target && source.length > 3;
  });

  if (untranslated.length > 0) {
    problems.push(
      `${locale}: ${untranslated.length} ta kalit tarjima qilinmagan — ${untranslated
        .slice(0, 5)
        .join(', ')}${untranslated.length > 5 ? ' …' : ''}`,
    );
  }
}

if (problems.length) {
  console.error('check-messages: tarjima fayllari mos kelmadi\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('\nmessages/uz.json, ru.json va en.json ni birga yangilang');
  process.exit(1);
}

console.log(`check-messages: ${baseKeys.length} ta kalit, uchala tilda ham to'liq`);
