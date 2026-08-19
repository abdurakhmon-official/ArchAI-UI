import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Providers } from '@/app/providers';
import { MessageBridge } from '@/components/layout/message-bridge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';
import { cn } from '@/lib/utils';
import '@/app/globals.css';

/**
 * Ildiz layout.
 *
 * DIQQAT: u `app/` da emas, `app/[locale]/` da turadi. Til segmenti ildiz
 * layoutdan oldin kelishi kerak — shundagina `next/root-params` va
 * `next-intl` ishlaydi. `app/layout.tsx` mavjud bo'lsa ikkita ildiz
 * paydo bo'ladi va Next xato beradi.
 */

const sans = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  /*
    `metadataBase` — barcha nisbiy manzillarning asosi.

    Usiz `openGraph.images` va `alternates.canonical` NISBIY qoladi:
    ular saytdan tashqarida (ijtimoiy tarmoq, qidiruv natijasi)
    ochilganda buziladi, va Next har qurishda ogohlantirish beradi.
  */
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ArchAI — Uy loyihasini onlayn yarating',
    template: '%s · ArchAI',
  },
  description:
    'Yer maydoni, o\'lcham va xonalar sonini kiriting — 2D reja, 3D ko\'rinish va taxminiy smeta bir necha daqiqada tayyor bo\'ladi.',
};

/**
 * Statik generatsiya uchun tillar ro'yxati. Busiz har bir til sahifasi
 * so'rov paytida qayta quriladi.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  // Statik renderda joriy tilni belgilaydi — busiz sahifalar dinamik bo'lib qoladi.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={cn('h-full antialiased', sans.variable, mono.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <NextIntlClientProvider>
          <Providers>
            {/*
              Server xabarlarini tarjimaga ulaydi.

              `lib/axios.ts` React daraxtidan tashqarida ishlaydi va
              u yerda ilgak chaqirib bo'lmaydi — bu komponent esa
              ichkarida turib tarjima funksiyasini uzatadi.
            */}
            <MessageBridge />

            {/* Base UI tooltip `delay` kutadi — Radix'dagi `delayDuration` emas. */}
            <TooltipProvider delay={200}>{children}</TooltipProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
