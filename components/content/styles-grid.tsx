'use client';
import Image from 'next/image';

import { useLocale, useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useStyles } from '@/hooks/use-catalog';
import { translated } from '@/lib/formatters';

export function StylesGrid() {
  const t = useTranslations('styles');
  const locale = useLocale();
  const styles = useStyles();

  if (styles.isPending) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-72 animate-pulse rounded-xl border bg-muted/30" />
        ))}
      </div>
    );
  }

  const items = styles.data ?? [];

  if (!items.length) {
    return (
      <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
        {t('empty')}
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((style) => {
        const roof = style.roof as { type?: string; pitch?: number };
        const interior = style.interior as { ceilingHeight?: number };

        return (
          <Card key={style.id} className="overflow-hidden">
            <CardContent className="flex flex-col gap-3">
              <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-lg bg-muted/40">
                {style.preview_url ? (
                  <Image
                    src={style.preview_url}
                    alt={translated(style.name, locale)}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">{t('noPreview')}</span>
                )}
              </div>

              <div>
                <h2 className="font-medium">{translated(style.name, locale)}</h2>
                {style.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {translated(style.description, locale)}
                  </p>
                ) : null}
              </div>

              <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {roof.type ? (
                  <div className="flex gap-1">
                    <dt>{t('roof')}:</dt>
                    <dd className="text-foreground">{t(`roofTypes.${roof.type}`)}</dd>
                  </div>
                ) : null}
                {interior.ceilingHeight ? (
                  <div className="flex gap-1">
                    <dt>{t('ceiling')}:</dt>
                    <dd className="font-mono text-foreground">{interior.ceilingHeight} m</dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>

            <CardFooter>
              {}
              <ButtonLink
                className="w-full"
                href={{ pathname: '/konstruktor', query: { uslub: style.slug } }}
              >
                {t('use')}
              </ButtonLink>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
