import { getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/button-link';

/**
 * Topilmagan sahifa.
 *
 * Ilgari umuman yo'q edi — foydalanuvchi Next'ning standart, tarjimasiz
 * va brendsiz sahifasini ko'rardi.
 *
 * Bu yerda tugmalar bor: bo'sh xabar o'rniga foydalanuvchini ishga
 * qaytaradigan ikkita yo'l.
 */
export default async function NotFound() {
  const t = await getTranslations('errors');

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-24 text-center">
      <p className="font-mono text-6xl font-semibold text-muted-foreground/40">404</p>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t('notFoundTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('notFoundText')}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <ButtonLink href="/">{t('home')}</ButtonLink>
        <ButtonLink href="/konstruktor" variant="outline">
          {t('constructor')}
        </ButtonLink>
      </div>
    </div>
  );
}
