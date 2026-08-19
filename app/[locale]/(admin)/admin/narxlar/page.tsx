import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PriceTable } from '@/components/admin/price-table';

export async function generateMetadata(props: PageProps<'/[locale]/admin/narxlar'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return { title: t('nav.prices') };
}

export default async function AdminPricesPage(props: PageProps<'/[locale]/admin/narxlar'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('nav.prices')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('prices.subtitle')}</p>
      </header>

      <PriceTable />
    </div>
  );
}
