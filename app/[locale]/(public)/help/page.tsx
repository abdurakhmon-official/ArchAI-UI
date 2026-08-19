import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FaqList } from '@/components/content/faq-list';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(props: PageProps<'/[locale]/yordam'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'help' });

  return pageMetadata({
    locale,
    href: '/yordam',
    title: t('title'),
    description: t('subtitle'),
  });
}

export default async function HelpPage(props: PageProps<'/[locale]/yordam'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'help' });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>

      <FaqList />
    </div>
  );
}
