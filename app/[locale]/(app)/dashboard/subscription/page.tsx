import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SubscriptionPanel } from '@/components/account/subscription-panel';

export async function generateMetadata(props: PageProps<'/[locale]/dashboard/subscription'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'subscription' });

  return { title: t('title') };
}

export default async function SubscriptionPage(props: PageProps<'/[locale]/dashboard/subscription'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'subscription' });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>
      </header>

      <SubscriptionPanel />
    </div>
  );
}
