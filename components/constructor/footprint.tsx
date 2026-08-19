'use client';

import { useTranslations } from 'next-intl';
import { MAX_FOOTPRINT_SHARE, type ConstructorParams } from '@/lib/constructor';
import { formatArea, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface Props {
  params: ConstructorParams;
  className?: string;
}

export function Footprint({ params, className }: Props) {
  const t = useTranslations('constructor');

  const landArea = params.landAreaSotix * 100;
  const plotSide = Math.sqrt(landArea);
  const share = landArea > 0 ? (params.width * params.length) / landArea : 1;
  const overflows = share > MAX_FOOTPRINT_SHARE;

  const side = Math.max(plotSide, params.width, params.length);
  const percent = (value: number) => `${(value / side) * 100}%`;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-dashed bg-muted/30">
        <span className="absolute start-2 top-2 font-mono text-[10px] text-muted-foreground">
          {formatNumber(plotSide)} × {formatNumber(plotSide)} m
        </span>

        {}
        <div
          className={cn(
            'absolute bottom-0 start-0 flex items-center justify-center border-2 transition-all',
            overflows
              ? 'border-destructive bg-destructive/15'
              : 'border-primary bg-primary/15',
          )}
          style={{ width: percent(params.width), height: percent(params.length) }}
        >
          <span className="font-mono text-[10px] font-medium">
            {formatNumber(params.width)}×{formatNumber(params.length)}
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{t('summary.footprint')}</dt>
          <dd className="font-mono tabular-nums">{formatArea(params.width * params.length)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t('summary.share')}</dt>
          <dd
            className={cn(
              'font-mono tabular-nums',
              overflows && 'font-semibold text-destructive',
            )}
          >
            {Math.round(share * 100)}% / {Math.round(MAX_FOOTPRINT_SHARE * 100)}%
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t('summary.totalArea')}</dt>
          <dd className="font-mono tabular-nums">
            {formatArea(params.width * params.length * params.floors)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t('summary.landArea')}</dt>
          <dd className="font-mono tabular-nums">{formatArea(landArea)}</dd>
        </div>
      </dl>
    </div>
  );
}
