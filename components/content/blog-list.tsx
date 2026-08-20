'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { formatDate, translated } from '@/lib/formatters';
import { queryKeys } from '@/lib/query-client';
import { contentService } from '@/lib/services';

export function BlogList() {
  const t = useTranslations('blog');
  const locale = useLocale();

  const posts = useQuery({
    queryKey: queryKeys.posts(),
    queryFn: () => contentService.posts({ limit: 24 }),
    staleTime: 5 * 60_000,
  });

  if (posts.isPending) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-64 animate-pulse rounded-xl border bg-muted/30" />
        ))}
      </div>
    );
  }

  const items = posts.data?.data ?? [];

  if (!items.length) {
    return (
      <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
        {t('empty')}
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((post) => (
        <Link key={post.id} href={{ pathname: '/blog/[slug]', params: { slug: post.slug } }}>
          <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-3">
              {post.coverUrl ? (
                <div className="relative aspect-16/9 overflow-hidden rounded-lg bg-muted/40">
                  {}
                  <Image
                    src={post.coverUrl}
                    alt={translated(post.title, locale)}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}

              {post.category ? (
                <span className="text-xs font-medium text-primary">
                  {translated(post.category.name, locale)}
                </span>
              ) : null}

              <h2 className="font-medium leading-snug">{translated(post.title, locale)}</h2>

              {post.excerpt ? (
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {translated(post.excerpt, locale)}
                </p>
              ) : null}

              <p className="mt-auto text-xs text-muted-foreground">
                {post.publishedAt ? formatDate(post.publishedAt, locale) : null}
                {post.author ? ` · ${post.author.fullName}` : ''}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
