import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export async function generateMetadata(props: PageProps<'/[locale]/admin'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return { title: t('title') };
}

export default async function AdminHomePage(props: PageProps<'/[locale]/admin'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('nav.dashboard')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      <AdminDashboard />
    </div>
  );
}
