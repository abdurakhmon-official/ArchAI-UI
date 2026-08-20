'use client';

import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

const LABELS: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: 'Русский',
  en: 'English',
};

export function LocaleSwitch() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    if (next === locale) return;

    /*
      `params` uzatiladi: dinamik segmentli manzillarda (`/project/[id]`)
      usiz yo'l noto'g'ri quriladi.

      Butun obyekt `any` ga o'giriladi, faqat `params` emas.
      `next-intl` `replace` uchun manzil va uning parametrlarini
      BOG'LANGAN birlashma sifatida kutadi ("`/project/[id]` bo'lsa
      `params.id` bo'lsin"), bu yerda esa `pathname` ish paytida
      aniqlanadigan qiymat — ya'ni birlashmaning istalgan a'zosi.
      TypeScript buni tekshira olmaydi: marshrutlar soni o'sgani sari
      tekshiruv qimmatlashadi va bir joyda umuman to'xtaydi.
    */
    startTransition(() => {
      router.replace(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { pathname, params } as any,
        { locale: next },
      );
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className="gap-1.5" disabled={pending} />}
      >
        <Globe className="size-4" />
        <span className="text-xs font-medium uppercase">{locale}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {routing.locales.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => switchTo(item)}
            className={item === locale ? 'font-semibold' : undefined}
          >
            {LABELS[item]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
