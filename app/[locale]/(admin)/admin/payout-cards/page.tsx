import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PayoutCards } from '@/components/admin/payout-cards';

export async function generateMetadata(props: PageProps<'/[locale]/admin/payout-cards'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return { title: t('nav.payoutCards') };
}

export default async function AdminPage(props: PageProps<'/[locale]/admin/payout-cards'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('nav.payoutCards')}</h1>
      </header>

      <PayoutCards />
    </div>
  );
}
