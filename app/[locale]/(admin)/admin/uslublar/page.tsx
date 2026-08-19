import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StyleEditor } from '@/components/admin/style-editor';

export async function generateMetadata(props: PageProps<'/[locale]/admin/uslublar'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return { title: t('nav.styles') };
}

export default async function AdminStylesPage(props: PageProps<'/[locale]/admin/uslublar'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('nav.styles')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('styles.subtitle')}</p>
      </header>

      <StyleEditor />
    </div>
  );
}
