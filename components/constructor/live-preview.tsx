'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { Plan2D } from '@/components/plan2d/plan-2d';
import { previewVariant } from '@/lib/generate';
import { houseFrom } from '@/lib/house';
import { usePreviewCatalog } from '@/hooks/use-preview';
import { formatArea, formatSumShort } from '@/lib/formatters';
import { useIssueText } from '@/hooks/use-issue-text';
import { cn } from '@/lib/utils';
import type { ConstructorParams } from '@/lib/constructor';
import type { GenerateParams } from '@/types/domain';
import { toGenerateParams } from '@/lib/constructor';

const DEBOUNCE_MS = 300;

interface Props {
  params: ConstructorParams;
  className?: string;
}

export function LivePreview({ params, className }: Props) {
  const issueText = useIssueText('geometry');
  const t = useTranslations('constructor.preview');
  const locale = useLocale();

  const catalog = usePreviewCatalog();

  const [settled, setSettled] = useState(params);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(params), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [params]);

  const pending = settled !== params;

  const variant = useMemo(() => {
    if (!catalog.ready) return null;

    try {
      return previewVariant({
        params: toGenerateParams(settled),
        skeletons: catalog.skeletons,
        styles: catalog.styles,
        rules: catalog.rules,
        names: catalog.names,
        book: catalog.book!,
      });
    } catch {
      return null;
    }
  }, [settled, catalog]);

  const floor = useMemo(() => {
    if (!variant) return null;

    const style = catalog.styles.find((item) => item.slug === variant.styleSlug) ?? null;
    return houseFrom(variant.geometry, { rules: catalog.rules, style }).floors[0];
  }, [variant, catalog.rules, catalog.styles]);

  const errors = variant?.issues.filter((issue) => issue.severity === 'error') ?? [];

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !catalog.ready) return;

    const global = window as unknown as { __archaiPreview?: unknown };

    global.__archaiPreview = (input: GenerateParams) => {
      const built = previewVariant({
        params: input,
        skeletons: catalog.skeletons,
        styles: catalog.styles,
        rules: catalog.rules,
        names: catalog.names,
        book: catalog.book!,
      });

      if (!built) return null;

      return {
        id: built.id,
        score: built.score,
        rooms: built.floors[0].rooms.length,
        area: built.measurements.FLOOR_AREA,
        total: built.estimateTotal,
        coverSvg: built.coverSvg,
      };
    };

    return () => {
      delete global.__archaiPreview;
    };
  }, [catalog]);

  return (
    <div
      data-slot="live-preview"
      className={cn('flex flex-col gap-3 rounded-xl border bg-card p-4', className)}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium">{t('title')}</h2>
        {pending || !catalog.ready ? (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />
        ) : null}
      </div>

      {!catalog.ready ? (
        <div className="aspect-4/3 animate-pulse rounded-lg bg-muted/40" />
      ) : floor ? (
        <>
          <div
            className={cn(
              'overflow-hidden rounded-lg border bg-background transition-opacity',
              pending && 'opacity-60',
            )}
          >
            <Plan2D
              floor={floor}
              names={catalog.names}
              showDimensions={false}
            />
          </div>

          <dl className="grid grid-cols-3 gap-2 text-sm">
            <Fact label={t('rooms')} value={String(variant!.floors[0].rooms.length)} />
            <Fact label={t('area')} value={formatArea(variant!.measurements.FLOOR_AREA, locale)} />
            <Fact label={t('score')} value={`${variant!.score}/100`} />
          </dl>

          <p className="font-mono text-lg font-semibold tabular-nums">
            {formatSumShort(variant!.estimateTotal, locale)}
          </p>

          {}
          {}
          {(variant!.steps.skipped ?? []).length > 0 ? (
            <ul className="flex flex-col gap-1 border-t pt-2">
              {variant!.steps.skipped.map((item) => (
                <li
                  key={item.roomType}
                  className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400"
                >
                  <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden />
                  {t('skipped', {
                    room: catalog.names[item.roomType] ?? item.roomType,
                    placed: item.placed,
                    wanted: item.wanted,
                  })}
                </li>
              ))}
            </ul>
          ) : null}

          {errors.length > 0 ? (
            <ul className="flex flex-col gap-1 border-t pt-2">
              {errors.slice(0, 3).map((issue, index) => (
                <li
                  key={`${issue.code}-${index}`}
                  className="flex items-start gap-1.5 text-xs text-destructive"
                >
                  <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden />
                  {issueText(issue.code, issue.values)}
                </li>
              ))}
            </ul>
          ) : null}

          <p className="text-xs text-muted-foreground">{t('hint')}</p>
        </>
      ) : (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-xs text-muted-foreground">
          {t('none')}
        </p>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-mono tabular-nums">{value}</dd>
    </div>
  );
}
