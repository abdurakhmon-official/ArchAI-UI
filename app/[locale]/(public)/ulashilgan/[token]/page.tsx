import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SharedProjectView } from '@/components/project/shared-project-view';

export async function generateMetadata(props: PageProps<'/[locale]/ulashilgan/[token]'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'project.shared' });

  // Ulashilgan loyiha shaxsiy — qidiruvga tushmasligi kerak.
  return { title: t('title'), robots: { index: false, follow: false } };
}

export default async function SharedProjectPage(props: PageProps<'/[locale]/ulashilgan/[token]'>) {
  const { locale, token } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <SharedProjectView token={token} />
    </div>
  );
}
