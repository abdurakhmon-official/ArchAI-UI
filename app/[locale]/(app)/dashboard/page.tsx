import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProjectList } from '@/components/project/project-list';

export async function generateMetadata(props: PageProps<'/[locale]/dashboard'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'cabinet' });

  return { title: t('title') };
}

export default async function CabinetPage(props: PageProps<'/[locale]/dashboard'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <ProjectList />
    </div>
  );
}
