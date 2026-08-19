import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ConstructorForm } from '@/components/constructor/constructor-form';
import { fromSearchParams } from '@/lib/constructor';
import { pageMetadata } from '@/lib/seo';

/**
 * Konstruktor.
 *
 * `searchParams` o'qiladi: natijalar sahifasidan orqaga qaytilganda
 * forma bo'shab qolmasligi kerak — foydalanuvchi kiritgan qiymatlar
 * URL'da turadi va shu yerdan tiklanadi.
 */

export async function generateMetadata(props: PageProps<'/[locale]/konstruktor'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'constructor' });

  return pageMetadata({
    locale,
    href: '/konstruktor',
    title: t('title'),
    description: t('subtitle'),
  });
}

export default async function ConstructorPage(props: PageProps<'/[locale]/konstruktor'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const search = await props.searchParams;
  const t = await getTranslations({ locale, namespace: 'constructor' });

  const entries = Object.entries(search).flatMap(([key, value]) =>
    value === undefined ? [] : [[key, Array.isArray(value) ? value[0] : value] as [string, string]],
  );

  const initial = entries.length ? fromSearchParams(new URLSearchParams(entries)) : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>

      <ConstructorForm initial={initial} />
    </div>
  );
}
