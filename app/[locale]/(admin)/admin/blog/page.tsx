import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BlogEditor } from '@/components/admin/blog-editor';

export async function generateMetadata(props: PageProps<'/[locale]/admin/blog'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return { title: t('nav.blog') };
}

export default async function AdminBlogPage(props: PageProps<'/[locale]/admin/blog'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('nav.blog')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('blog.subtitle')}</p>
      </header>

      <BlogEditor />
    </div>
  );
}
