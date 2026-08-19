'use client';

import { AlertTriangle, ArrowRight, Layers, Maximize } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PlanCover } from '@/components/plan2d/plan-cover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatArea, formatSumShort } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Variant } from '@/types/domain';

interface Props {
  variant: Variant;
  index: number;
  names: Record<string, string>;
  comparing?: boolean;
  onCompare?: () => void;
  selected?: boolean;
  onOpen: (variant: Variant) => void;
  className?: string;
}

export function VariantCard({
  variant,
  index,
  names,
  comparing,
  onCompare,
  selected,
  onOpen,
  className,
}: Props) {
  const t = useTranslations('results');

  const errors = variant.issues.filter((issue) => issue.severity === 'error').length;
  const warnings = variant.issues.length - errors;
  const skipped = variant.steps.skipped ?? [];

  const parts = variant.scoreParts ?? {
    plan: variant.score,
    fit: variant.score,
    errors,
    warnings,
  };

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-shadow hover:shadow-md',
        selected && 'ring-2 ring-primary',
        className,
      )}
    >
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{variant.skeletonName}</p>
            <p className="text-xs text-muted-foreground">
              {t('option', { index: index + 1 })}
            </p>
          </div>

          {}
          <Tooltip>
            <TooltipTrigger
              render={
                <Badge
                  variant={variant.score >= 75 ? 'default' : 'secondary'}
                  className="shrink-0 cursor-help"
                />
              }
            >
              {t('score')} {variant.score}
            </TooltipTrigger>

            <TooltipContent className="max-w-64">
              <p className="font-medium">{t('scoreTitle', { score: variant.score })}</p>
              <p className="mt-1">
                {t('scorePlan', { value: parts.plan })}
                {' · '}
                {t('scoreFit', { value: parts.fit })}
                {typeof parts.orientation === 'number'
                  ? ` · ${t('scoreOrientation', { value: parts.orientation })}`
                  : ''}
              </p>
              {parts.errors > 0 || parts.warnings > 0 ? (
                <p className="mt-1 opacity-80">
                  {t('scoreIssues', {
                    errors: parts.errors,
                    warnings: parts.warnings,
                  })}
                </p>
              ) : (
                <p className="mt-1 opacity-80">{t('scoreClean')}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>

        <PlanCover svg={variant.coverSvg} />

        <dl className="grid grid-cols-3 gap-2 text-sm">
          <Metric
            icon={<Maximize className="size-3.5" />}
            label={t('area')}
            value={formatArea(variant.measurements.FLOOR_AREA)}
          />
          <Metric
            icon={<Layers className="size-3.5" />}
            label={t('roomsLabel')}
            value={String(variant.measurements.ROOM_COUNT)}
          />
          <Metric
            label={t('price')}
            value={formatSumShort(variant.estimateTotal)}
            className="text-end"
          />
        </dl>

        {}
        {skipped.length > 0 ? (
          <p className="flex items-start gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/5 px-2.5 py-2 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {skipped
                .map((item) =>
                  t('skippedRoom', {
                    room: names[item.roomType] ?? item.roomType,
                    placed: item.placed,
                    wanted: item.wanted,
                  }),
                )
                .join(', ')}
            </span>
          </p>
        ) : null}

        {errors > 0 || warnings > 0 ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertTriangle
              className={cn('size-3.5', errors > 0 ? 'text-destructive' : 'text-muted-foreground')}
            />
            {errors > 0 ? t('errors', { count: errors }) : t('warnings', { count: warnings })}
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button className="w-full" onClick={() => onOpen(variant)}>
          {t('open')}
          <ArrowRight className="size-4" />
        </Button>

        {onCompare ? (
          <label className="flex w-full cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={Boolean(comparing)}
              onChange={onCompare}
              className="size-3.5 accent-primary"
            />
            {t('compare')}
          </label>
        ) : null}
      </CardFooter>
    </Card>
  );
}

function Metric({
  icon,
  label,
  value,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </dt>
      <dd className="truncate font-mono text-sm tabular-nums">{value}</dd>
    </div>
  );
}
