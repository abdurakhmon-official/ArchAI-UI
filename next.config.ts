import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** `https://archai-api.onrender.com/api` -> `archai-api.onrender.com` */
const apiHost = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) return null;

  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Docker image'ni ~1.2 GB dan ~180 MB ga tushiradi: faqat kerakli
  // `node_modules` fayllari nusxalanadi.
  output: 'standalone',

  images: {
    remotePatterns: [
      // Fayllar API orqali beriladi: `/api/s3/file/<key>` imzolangan
      // havolaga yo'naltiradi. To'g'ridan-to'g'ri S3 manzili ishlatilmaydi,
      // chunki bucket yopiq.
      { protocol: 'http', hostname: 'localhost' },
      // Ishlab chiqarishdagi API domeni. `NEXT_PUBLIC_API_URL` dan
      // olinadi — domen o'zgarsa bu ro'yxatni qo'lda yangilash
      // esdan chiqmasin uchun.
      ...(apiHost ? [{ protocol: 'https' as const, hostname: apiHost }] : []),
      { protocol: 'https', hostname: '**.archai.uz' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },

  // Diqqat: Next.js 16 da `eslint` va `typescript` kalitlari
  // `next.config` dan olib tashlangan. Lint va typecheck alohida
  // qadamlar sifatida CI da ishlaydi.
};

export default withNextIntl(nextConfig);
