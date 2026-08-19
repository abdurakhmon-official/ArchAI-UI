import { setRequestLocale } from 'next-intl/server';
import { BlogPostView } from '@/components/content/blog-post';
import { translated } from '@/lib/formatters';
import { pageMetadata } from '@/lib/seo';
import { fetchPost } from '@/lib/server-api';

/**
 * Maqola sahifasi.
 *
 * Metama'lumot SERVERDA olinadi. Ilgari bu sahifada `generateMetadata`
 * umuman yo'q edi va har bir maqola layoutdagi sukut sarlavhasi bilan
 * indekslanardi — ya'ni o'nlab maqola qidiruvda bir xil nom bilan
 * chiqardi. Blog esa organik trafikning asosiy manbasi.
 */

export async function generateMetadata(props: PageProps<'/[locale]/blog/[slug]'>) {
  const { locale, slug } = await props.params;
  const post = await fetchPost(slug);

  if (!post) {
    // Maqola yo'q — sahifa 404 chizadi, sarlavha esa umumiy qoladi.
    return pageMetadata({ locale, href: '/blog', title: 'Blog' });
  }

  const title = translated(post.title, locale);
  const description = translated(post.excerpt, locale);

  return {
    ...pageMetadata({
      locale,
      href: '/blog',
      title,
      ...(description ? { description } : {}),
    }),
    /*
      Kanonik manzil aynan MAQOLANIKI bo'lishi kerak.

      `pageMetadata` marshrut bo'yicha ishlaydi va dinamik segmentni
      bilmaydi, shuning uchun uni shu yerda to'g'rilaymiz. Aks holda
      hamma maqola `/blog` ga ishora qilib, o'zi indeksdan tushib
      qolardi.
    */
    alternates: { canonical: `/${locale}/blog/${slug}` },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      type: 'article',
      ...(post.published_at ? { publishedTime: post.published_at } : {}),
      ...(post.cover_url ? { images: [post.cover_url] } : {}),
    },
  };
}

export default async function PostPage(props: PageProps<'/[locale]/blog/[slug]'>) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <BlogPostView slug={slug} />
    </div>
  );
}
