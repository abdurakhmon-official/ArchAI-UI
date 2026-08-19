import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['uz', 'ru', 'en'],
  defaultLocale: 'uz',
  localePrefix: 'always',

  pathnames: {
    '/': '/',
    '/konstruktor': {
      uz: '/konstruktor',
      ru: '/konstruktor',
      en: '/constructor',
    },
    '/konstruktor/natijalar': {
      uz: '/konstruktor/natijalar',
      ru: '/konstruktor/rezultaty',
      en: '/constructor/results',
    },
    '/uslublar': { uz: '/uslublar', ru: '/stili', en: '/styles' },
    '/uslublar/[slug]': {
      uz: '/uslublar/[slug]',
      ru: '/stili/[slug]',
      en: '/styles/[slug]',
    },
    '/narxlash': { uz: '/narxlash', ru: '/tarify', en: '/pricing' },
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
    '/yordam': { uz: '/yordam', ru: '/pomoshch', en: '/help' },
    '/biz-haqimizda': { uz: '/biz-haqimizda', ru: '/o-nas', en: '/about' },
    '/kirish': { uz: '/kirish', ru: '/vhod', en: '/sign-in' },
    '/royxatdan-otish': {
      uz: '/royxatdan-otish',
      ru: '/registratsiya',
      en: '/sign-up',
    },

    '/parolni-unutdim': {
      uz: '/parolni-unutdim',
      ru: '/zabyl-parol',
      en: '/forgot-password',
    },
    '/parol-tiklash/[token]': {
      uz: '/parol-tiklash/[token]',
      ru: '/sbros-parolya/[token]',
      en: '/reset-password/[token]',
    },
    '/email-tasdiqlash/[token]': {
      uz: '/email-tasdiqlash/[token]',
      ru: '/podtverzhdenie-email/[token]',
      en: '/verify-email/[token]',
    },
    '/ulashilgan/[token]': {
      uz: '/ulashilgan/[token]',
      ru: '/obshchiy/[token]',
      en: '/shared/[token]',
    },
    '/kabinet': { uz: '/kabinet', ru: '/kabinet', en: '/dashboard' },
    '/kabinet/profil': {
      uz: '/kabinet/profil',
      ru: '/kabinet/profil',
      en: '/dashboard/profile',
    },
    '/kabinet/obuna': {
      uz: '/kabinet/obuna',
      ru: '/kabinet/podpiska',
      en: '/dashboard/subscription',
    },
    '/loyiha/[id]': {
      uz: '/loyiha/[id]',
      ru: '/proekt/[id]',
      en: '/project/[id]',
    },

    '/admin': '/admin',
    '/admin/narxlar': '/admin/narxlar',
    '/admin/xona-turlari': '/admin/xona-turlari',
    '/admin/uslublar': '/admin/uslublar',
    '/admin/tom-uslublari': '/admin/tom-uslublari',
    '/admin/blog': '/admin/blog',
    '/admin/savollar': '/admin/savollar',
    '/admin/murojaatlar': '/admin/murojaatlar',
    '/admin/loyihalar': '/admin/loyihalar',
    '/admin/media': '/admin/media',
    '/admin/andozalar': '/admin/andozalar',
    '/admin/tariflar': '/admin/tariflar',
    '/admin/foydalanuvchilar': '/admin/foydalanuvchilar',
    '/admin/jurnal': '/admin/jurnal',
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
