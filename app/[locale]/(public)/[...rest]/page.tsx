import { notFound } from 'next/navigation';

/**
 * Mos kelmagan manzillar uchun.
 *
 * `app/[locale]/not-found.tsx` faqat `notFound()` KOD ichidan
 * chaqirilganda ishlaydi. Mavjud bo'lmagan URL esa `[locale]` segmentiga
 * umuman tushmaydi va Next o'zining ildiz 404 sahifasini ko'rsatadi —
 * tarjimasiz, brendsiz, "This page could not be found".
 *
 * Bu catch-all shu bo'shliqni yopadi: manzil segmentga tushadi,
 * `notFound()` chaqiriladi va tilga mos sahifa chiziladi. `(public)`
 * guruhi ichida turgani uchun sarlavha va futer ham joyida qoladi.
 *
 * Catch-all eng past ustuvorlikka ega, ya'ni haqiqiy marshrutlarni
 * to'sib qo'ymaydi.
 */
export default function CatchAll() {
  notFound();
}
