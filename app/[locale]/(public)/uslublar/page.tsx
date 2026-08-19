import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StylesGrid } from '@/components/content/styles-grid';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(props: PageProps<'/[locale]/uslublar'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'styles' });

  return pageMetadata({
    locale,
    href: '/uslublar',
    title: t('title'),
    description: t('subtitle'),
  });
}

export default async function StylesPage(props: PageProps<'/[locale]/uslublar'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'styles' });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>

      <StylesGrid />
    </div>
  );
}
