import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SkeletonEditor } from '@/components/admin/skeleton-editor';

export async function generateMetadata(props: PageProps<'/[locale]/admin/andozalar'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return { title: t('nav.skeletons') };
}

export default async function AdminSkeletonsPage(props: PageProps<'/[locale]/admin/andozalar'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('nav.skeletons')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('skeletons.subtitle')}</p>
      </header>

      <SkeletonEditor />
    </div>
  );
}
