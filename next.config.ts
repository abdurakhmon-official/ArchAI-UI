import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

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
      { protocol: 'https', hostname: '**.archai.uz' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },

  // Diqqat: Next.js 16 da `eslint` va `typescript` kalitlari
  // `next.config` dan olib tashlangan. Lint va typecheck alohida
  // qadamlar sifatida CI da ishlaydi.
};

export default withNextIntl(nextConfig);
