import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ExportList } from '@/components/admin/export-list';
import { MediaLibrary } from '@/components/admin/media-library';

export async function generateMetadata(props: PageProps<'/[locale]/admin/media'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return { title: t('nav.media') };
}

export default async function AdminMediaPage(props: PageProps<'/[locale]/admin/media'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('nav.media')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('media.subtitle')}</p>
      </header>

      <MediaLibrary />

      {/* Generatsiya qilingan fayllar — alohida bo'lim. */}
      <ExportList />
    </div>
  );
}
