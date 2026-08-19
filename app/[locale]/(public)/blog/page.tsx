import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BlogList } from '@/components/content/blog-list';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(props: PageProps<'/[locale]/blog'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  return pageMetadata({
    locale,
    href: '/blog',
    title: t('title'),
    description: t('subtitle'),
  });
}

export default async function BlogPage(props: PageProps<'/[locale]/blog'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'blog' });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>

      <BlogList />
    </div>
  );
}
