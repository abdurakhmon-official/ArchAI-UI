import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProjectTable } from '@/components/admin/project-table';

export async function generateMetadata(props: PageProps<'/[locale]/admin/loyihalar'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return { title: t('nav.projects') };
}

export default async function AdminProjectsPage(props: PageProps<'/[locale]/admin/loyihalar'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('nav.projects')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('projects.subtitle')}</p>
      </header>

      <ProjectTable />
    </div>
  );
}
