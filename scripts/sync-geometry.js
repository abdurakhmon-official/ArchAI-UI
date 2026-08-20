/**
 * `api/geometry` va `api/shared` ni `ui/lib/` ga nusxalaydi.
 *
 * Yagona manba — `api/`. Lekin `ui` alohida repozitoriyada va Vercel
 * uni yolg'iz klonlaydi, ya'ni `../api` u yerda YO'Q.
 *
 * Shuning uchun nusxalar `ui/lib/geometry` va `ui/lib/shared` da
 * commit qilinadi va bu skript ularni faqat `api/` yonida turganda
 * yangilaydi. Vercel'da u jimgina o'tkazib yuboriladi va build
 * commit qilingan nusxa bilan davom etadi.
 *
 * Diqqat: geometriyani o'zgartirsangiz, `ui` dagi nusxani ham
 * commit qiling — aks holda ikki tomon jimgina ajralib ketadi.
 */

const { existsSync } = require('node:fs');
const { join } = require('node:path');

const source = join(__dirname, '..', '..', 'api', 'scripts', 'sync-geometry.js');

if (!existsSync(source)) {
  console.warn("sync-geometry: api/ topilmadi, commit qilingan nusxa ishlatiladi");
  process.exit(0);
}

require(source);
