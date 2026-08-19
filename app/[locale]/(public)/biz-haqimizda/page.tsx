import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(props: PageProps<'/[locale]/biz-haqimizda'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return pageMetadata({
    locale,
    href: '/biz-haqimizda',
    title: t('title'),
    description: t('lead'),
  });
}

export default async function AboutPage(props: PageProps<'/[locale]/biz-haqimizda'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'about' });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{t('lead')}</p>

      <div className="mt-8 max-w-[65ch] whitespace-pre-line leading-relaxed">{t('body')}</div>

      {/*
        Ogohlantirish alohida ajratilgan: smeta va reja yuridik kuchga
        ega hujjat emas va foydalanuvchi buni aniq bilishi kerak.
      */}
      <aside className="mt-10 rounded-xl border border-dashed px-5 py-4">
        <h2 className="text-sm font-medium">{t('disclaimerTitle')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('disclaimer')}</p>
      </aside>
    </div>
  );
}
