/**
 * Konstruktor chegaralari ikki joyda yozilgan: serverda
 * `api/inputs/generation.input.ts`, brauzerda `ui/lib/constructor.ts`.
 *
 * Ikkinchisi kerak — server sxemasi zod'ning boshqa versiyasida va Ts.ED
 * bilan bog'langan, uni brauzerga olib kelib bo'lmaydi. Lekin nusxa
 * jimgina eskirsa, foydalanuvchi formada ruxsat berilgan qiymatni
 * kiritadi va server uni 400 bilan rad etadi — sababi ko'rinmaydi.
 *
 * Shu sababli yig'ishdan oldin ikkalasi solishtiriladi.
 *
 * XONA CHEGARALARI BU YERDA TEKSHIRILMAYDI.
 *
 * Ular endi bazada (`RoomType.max_count`, `default_count`) va ikki
 * tomonga bir xil uchdan keladi — takrorlanmaydi, ya'ni ajralib ketishi
 * ham mumkin emas. Buning o'rniga quyida ikkala fayl xona chegarasini
 * QATTIQ YOZMAGANI tekshiriladi: kimdir "vaqtinchalik" deb `bedroom:
 * z.number().max(8)` qaytarib qo'ysa, dinamik katalog jimgina buziladi
 * va admin qo'shgan yangi tur yana ko'rinmay qoladi.
 */

const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const API = join(__dirname, '../../api/inputs/generation.input.ts');
const UI = join(__dirname, '../lib/constructor.ts');

/**
 * Solishtiriladigan maydonlar — hammasi skalyar va ikki tomonda ham
 * qo'lda yozilgan.
 *
 * Ro'yxat aniq: `matchAll` bilan hamma `z.number()` ni yig'ish xona
 * sxemasidagi qo'pol himoya chegaralarini ham tortib olardi va ular
 * ma'nosiz solishtirilardi.
 */
const SCALARS = ['landAreaSotix', 'width', 'length', 'floors', 'garage', 'variants'];

/** Ilgari konstruktorda so'ralgan, endi bazadan keladigan xona kodlari. */
const ROOM_CODES = ['bedroom', 'living', 'bathroom', 'office', 'dining'];

/** `width: z.number().min(4).max(40)` → { min: 4, max: 40 } */
function limitOf(source, field) {
  const match = source.match(new RegExp(`\\b${field}:\\s*z\\s*\\.number\\(\\)([^,\\n]*)`));
  if (!match) return null;

  const min = match[1].match(/\.min\((-?[\d.]+)\)/);
  const max = match[1].match(/\.max\((-?[\d.]+)\)/);

  return { min: min ? Number(min[1]) : null, max: max ? Number(max[1]) : null };
}

function extractShare(source) {
  const match = source.match(/MAX_FOOTPRINT_SHARE\s*=\s*([\d.]+)/);
  return match ? Number(match[1]) : null;
}

const apiSource = readFileSync(API, 'utf8');
const uiSource = readFileSync(UI, 'utf8');

const problems = [];
let compared = 0;

for (const field of SCALARS) {
  const api = limitOf(apiSource, field);
  const ui = limitOf(uiSource, field);

  if (!api) {
    problems.push(`"${field}" serverda topilmadi — tekshiruv eskirgan`);
    continue;
  }

  if (!ui) {
    problems.push(`"${field}" brauzerda topilmadi — tekshiruv eskirgan`);
    continue;
  }

  compared += 1;

  if (api.min !== ui.min || api.max !== ui.max) {
    problems.push(
      `"${field}" chegarasi farq qiladi — server: ${api.min}..${api.max}, brauzer: ${ui.min}..${ui.max}`,
    );
  }
}

// --- Xona sxemasi dinamik qolganini tekshiramiz ---------------------------

for (const [label, source] of [
  ['server', apiSource],
  ['brauzer', uiSource],
]) {
  if (!/RoomCountsSchema\s*=\s*z[\s\S]{0,80}?\.record\(/.test(source)) {
    problems.push(
      `${label} tomonda RoomCountsSchema z.record() emas — xona turlari yana qattiq yozilgan`,
    );
  }

  for (const code of ROOM_CODES) {
    if (new RegExp(`\\b${code}:\\s*z\\s*\\.number\\(\\)`).test(source)) {
      problems.push(
        `${label} tomonda "${code}" sxemada qattiq yozilgan — chegara bazadan kelishi kerak`,
      );
    }
  }
}

const apiShare = extractShare(apiSource);
const uiShare = extractShare(uiSource);

if (apiShare !== uiShare) {
  problems.push(`MAX_FOOTPRINT_SHARE farq qiladi — server: ${apiShare}, brauzer: ${uiShare}`);
}

if (problems.length) {
  console.error('check-limits: konstruktor chegaralari mos kelmadi\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('\nIkkalasini birga yangilang: api/inputs/generation.input.ts, ui/lib/constructor.ts');
  process.exit(1);
}

console.log(
  `check-limits: ${compared} ta chegara mos, qurilish ulushi ${apiShare}, xona turlari dinamik`,
);
