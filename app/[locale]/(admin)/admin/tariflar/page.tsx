import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PlanTable } from '@/components/admin/plan-table';

export async function generateMetadata(props: PageProps<'/[locale]/admin/tariflar'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return { title: t('nav.plans') };
}

export default async function AdminPage(props: PageProps<'/[locale]/admin/tariflar'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('nav.plans')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('plans.subtitle')}</p>
      </header>

      <PlanTable />
    </div>
  );
}
