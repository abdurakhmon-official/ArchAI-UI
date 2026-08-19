import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LeadTable } from '@/components/admin/lead-table';

export async function generateMetadata(props: PageProps<'/[locale]/admin/murojaatlar'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return { title: t('nav.leads') };
}

export default async function AdminLeadsPage(props: PageProps<'/[locale]/admin/murojaatlar'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('nav.leads')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('leads.subtitle')}</p>
      </header>

      <LeadTable />
    </div>
  );
}
