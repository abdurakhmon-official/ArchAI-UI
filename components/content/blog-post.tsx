'use client';
import Image from 'next/image';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Markdown } from '@/components/content/markdown';
import { ButtonLink } from '@/components/ui/button-link';
import { errorFrom } from '@/lib/errors';
import { formatDate, translated } from '@/lib/formatters';
import { contentService } from '@/lib/services';

export function BlogPostView({ slug }: { slug: string }) {
  const t = useTranslations('blog');
  const locale = useLocale();

  const post = useQuery({
    queryKey: ['post', slug],
    queryFn: () => contentService.post(slug),
    retry: false,
  });

  if (post.isPending) {
    return <div className="h-96 animate-pulse rounded-xl bg-muted/30" />;
  }

  if (post.isError) {
    const detail = errorFrom(post.error);
    return (
      <div className="rounded-xl border border-dashed px-6 py-16 text-center">
        <p className="font-medium">{detail.status === 404 ? t('notFound') : detail.message}</p>
        <ButtonLink variant="outline" size="sm" href="/blog" className="mt-4">
          <ArrowLeft className="size-4" />
          {t('backToList')}
        </ButtonLink>
      </div>
    );
  }

  const data = post.data;

  return (
    <article className="flex flex-col gap-6">
      <ButtonLink variant="ghost" size="sm" href="/blog" className="self-start">
        <ArrowLeft className="size-4" />
        {t('backToList')}
      </ButtonLink>

      <header className="flex flex-col gap-3">
        {data.category ? (
          <span className="text-sm font-medium text-primary">
            {translated(data.category.name, locale)}
          </span>
        ) : null}

        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          {translated(data.title, locale)}
        </h1>

        <p className="text-sm text-muted-foreground">
          {data.publishedAt ? formatDate(data.publishedAt, locale) : null}
          {data.author ? ` · ${data.author.fullName}` : ''}
          {` · ${t('views', { count: data.views })}`}
        </p>
      </header>

      {data.coverUrl ? (
        <div className="relative aspect-16/9 overflow-hidden rounded-xl bg-muted/40">
          {}
          <Image
            src={data.coverUrl}
            alt={translated(data.title, locale)}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <Markdown className="max-w-[65ch]">{translated(data.body, locale)}</Markdown>
    </article>
  );
}
