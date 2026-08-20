import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PricingTable } from '@/components/billing/pricing-table';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(props: PageProps<'/[locale]/pricing'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'pricing' });

  return pageMetadata({
    locale,
    href: '/pricing',
    title: t('title'),
    description: t('subtitle'),
  });
}

export default async function PricingPage(props: PageProps<'/[locale]/pricing'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'pricing' });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>

      <PricingTable />
    </div>
  );
}
