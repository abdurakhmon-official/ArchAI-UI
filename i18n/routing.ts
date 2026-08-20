import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['uz', 'ru', 'en'],
  defaultLocale: 'uz',
  localePrefix: 'always',

  pathnames: {
    '/': '/',
    '/constructor': {
      uz: '/konstruktor',
      ru: '/konstruktor',
      en: '/constructor',
    },
    '/constructor/results': {
      uz: '/konstruktor/natijalar',
      ru: '/konstruktor/rezultaty',
      en: '/constructor/results',
    },
    '/styles': { uz: '/uslublar', ru: '/stili', en: '/styles' },
    '/styles/[slug]': {
      uz: '/uslublar/[slug]',
      ru: '/stili/[slug]',
      en: '/styles/[slug]',
    },
    '/pricing': { uz: '/narxlash', ru: '/tarify', en: '/pricing' },
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
    '/help': { uz: '/yordam', ru: '/pomoshch', en: '/help' },
    '/about': { uz: '/biz-haqimizda', ru: '/o-nas', en: '/about' },
    '/sign-in': { uz: '/kirish', ru: '/vhod', en: '/sign-in' },
    '/sign-up': {
      uz: '/royxatdan-otish',
      ru: '/registratsiya',
      en: '/sign-up',
    },

    '/forgot-password': {
      uz: '/parolni-unutdim',
      ru: '/zabyl-parol',
      en: '/forgot-password',
    },
    '/reset-password/[token]': {
      uz: '/parol-tiklash/[token]',
      ru: '/sbros-parolya/[token]',
      en: '/reset-password/[token]',
    },
    '/verify-email/[token]': {
      uz: '/email-tasdiqlash/[token]',
      ru: '/podtverzhdenie-email/[token]',
      en: '/verify-email/[token]',
    },
    '/shared/[token]': {
      uz: '/ulashilgan/[token]',
      ru: '/obshchiy/[token]',
      en: '/shared/[token]',
    },
    '/dashboard': { uz: '/kabinet', ru: '/kabinet', en: '/dashboard' },
    '/dashboard/profile': {
      uz: '/kabinet/profil',
      ru: '/kabinet/profil',
      en: '/dashboard/profile',
    },
    '/dashboard/subscription': {
      uz: '/kabinet/obuna',
      ru: '/kabinet/podpiska',
      en: '/dashboard/subscription',
    },
    '/project/[id]': {
      uz: '/loyiha/[id]',
      ru: '/proekt/[id]',
      en: '/project/[id]',
    },

    '/admin': '/admin',
    '/admin/prices': '/admin/prices',
    '/admin/room-types': '/admin/room-types',
    '/admin/styles': '/admin/styles',
    '/admin/roof-styles': '/admin/roof-styles',
    '/admin/blog': '/admin/blog',
    '/admin/faq': '/admin/faq',
    '/admin/leads': '/admin/leads',
    '/admin/projects': '/admin/projects',
    '/admin/media': '/admin/media',
    '/admin/skeletons': '/admin/skeletons',
    '/admin/plans': '/admin/plans',
    '/admin/payout-cards': '/admin/payout-cards',
    '/admin/users': '/admin/users',
    '/admin/audit': '/admin/audit',
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
