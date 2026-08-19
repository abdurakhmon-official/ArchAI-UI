import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FaqEditor } from '@/components/admin/faq-editor';

export async function generateMetadata(props: PageProps<'/[locale]/admin/savollar'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return { title: t('nav.faq') };
}

export default async function AdminFaqPage(props: PageProps<'/[locale]/admin/savollar'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('nav.faq')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('faq.subtitle')}</p>
      </header>

      <FaqEditor />
    </div>
  );
}
