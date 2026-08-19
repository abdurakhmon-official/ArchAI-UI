import type { MetadataRoute } from 'next';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { fetchPostSlugs } from '@/lib/server-api';
import { SITE_URL } from '@/lib/seo';

/**
 * Sayt xaritasi.
 *
 * Ilgari umuman yo'q edi: qidiruv tizimlari sahifalarni faqat
 * havolalar orqali topardi va yangi maqolalar indeksga uzoq tushardi.
 *
 * Har bir sahifa uchun UCHALA til ham beriladi va ular `alternates`
 * orqali bir-biriga bog'lanadi — aks holda Google ularni alohida,
 * bir-biri bilan raqobatlashadigan sahifa deb ko'radi.
 *
 * `app/` ildizida turadi, `app/[locale]/` da emas: sitemap butun sayt
 * uchun bitta va u til segmentiga bog'liq emas.
 */

/**
 * Indekslanadigan sahifalar.
 *
 * Kabinet, admin va autentifikatsiya sahifalari ATAYLAB yo'q: ular
 * kirishni talab qiladi va qidiruv natijasida ko'rinishining ma'nosi
 * yo'q. Konstruktor natijalari ham yo'q — ular so'rov parametrlariga
 * bog'liq va har biri noyob.
 */
const ROUTES = [
  { href: '/', priority: 1, changeFrequency: 'monthly' },
  { href: '/konstruktor', priority: 0.9, changeFrequency: 'monthly' },
  { href: '/uslublar', priority: 0.8, changeFrequency: 'monthly' },
  { href: '/narxlash', priority: 0.8, changeFrequency: 'monthly' },
  { href: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { href: '/yordam', priority: 0.6, changeFrequency: 'monthly' },
  { href: '/biz-haqimizda', priority: 0.5, changeFrequency: 'yearly' },
] as const;

/** Bitta manzilning barcha tillardagi shakllari. */
function alternatesFor(href: (typeof ROUTES)[number]['href'] | '/blog'): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, SITE_URL + getPathname({ href, locale })]),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages = ROUTES.flatMap((route) => {
    const languages = alternatesFor(route.href);

    return routing.locales.map((locale) => ({
      url: languages[locale],
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages },
    }));
  });

  /*
    Maqolalar API'dan olinadi.

    API tushib qolgan bo'lsa bo'sh ro'yxat qaytadi va sitemap statik
    sahifalar bilan chiqadi — bu butunlay yiqilishdan yaxshiroq.
  */
  const posts = await fetchPostSlugs();

  const postPages = posts.flatMap((post) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [
        locale,
        `${SITE_URL}${getPathname({ href: '/blog', locale })}/${post.slug}`,
      ]),
    );

    return routing.locales.map((locale) => ({
      url: languages[locale],
      lastModified: post.updated ? new Date(post.updated) : now,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
      alternates: { languages },
    }));
  });

  return [...staticPages, ...postPages];
}
