import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * Qidiruv robotlari uchun qoidalar.
 *
 * Ilgari fayl umuman yo'q edi va robotlar hamma narsani — jumladan
 * kabinet va admin sahifalarini — aylanib chiqardi. Ular baribir
 * kirishni talab qiladi, ya'ni robot faqat yo'naltirishlarni ko'rib,
 * indeksga axlat qo'shardi.
 *
 * DIQQAT: bu himoya EMAS. `robots.txt` — iltimos, qulf emas: yopiq
 * ma'lumot baribir server tomonida himoyalangan bo'lishi kerak
 * (`AdminOnly`, `Authenticate`). Bu fayl faqat indeksni toza tutadi.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        // Kirishni talab qiladigan bo'limlar.
        '/*/kabinet',
        '/*/dashboard',
        '/*/admin',
        '/*/kirish',
        '/*/vhod',
        '/*/sign-in',
        '/*/royxatdan-otish',
        '/*/registratsiya',
        '/*/sign-up',
        // Parolni tiklash havolalari — ular bir martalik va shaxsiy.
        '/*/parol-tiklash',
        '/*/sbros-parolya',
        '/*/reset-password',
        '/*/email-tasdiqlash',
        '/*/podtverzhdenie-email',
        '/*/verify-email',
        '/*/parolni-unutdim',
        '/*/zabyl-parol',
        '/*/forgot-password',
        // Loyiha sahifasi — egasiga tegishli.
        '/*/loyiha',
        '/*/project',
        /*
          Konstruktor natijalari.

          Har natija so'rov parametrlariga bog'liq va cheksiz ko'p
          variant bor — robot ularni aylanib chiqsa, serverga behuda
          yuk tushadi va indeksga hech kimga keraksiz sahifalar
          to'planadi.
        */
        '/*/konstruktor/natijalar',
        '/*/konstruktor/rezultaty',
        '/*/constructor/results',
        // Ishlab chiqish sahifalari.
        '/*/dev',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
