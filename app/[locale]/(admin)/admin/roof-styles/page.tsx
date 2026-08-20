import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RoofStyleEditor } from '@/components/admin/roof-style-editor';

export async function generateMetadata(props: PageProps<'/[locale]/admin/roof-styles'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return { title: t('nav.roofStyles') };
}

export default async function AdminRoofStylesPage(
  props: PageProps<'/[locale]/admin/roof-styles'>,
) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('nav.roofStyles')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('roofStyles.subtitle')}</p>
      </header>

      <RoofStyleEditor />
    </div>
  );
}
