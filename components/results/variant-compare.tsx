'use client';

import { ArrowRight, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { PlanCover } from '@/components/plan2d/plan-cover';
import { Button } from '@/components/ui/button';
import { formatArea, formatSumShort } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Variant } from '@/types/domain';

/**
 * Variantlarni yonma-yon solishtirish.
 *
 * Ilgari variantlarni faqat birma-bir ochish mumkin edi: foydalanuvchi
 * birini ko'rib, orqaga qaytib, ikkinchisini ochardi va sonlarni
 * xotirasida solishtirardi. Farq esa ko'pincha bir necha foizda —
 * xotirada bunday taqqoslash ishlamaydi.
 */

/** Solishtirish uchun ko'rsatiladigan qatorlar. */
type Row = {
  key: string;
  value: (variant: Variant) => number;
  format: (variant: Variant, locale: string) => string;
  /** Katta qiymat yaxshimi. Narxda — aksincha. */
  higherIsBetter: boolean;
};

const ROWS: Row[] = [
  {
    key: 'score',
    value: (v) => v.score,
    format: (v) => `${v.score}/100`,
    higherIsBetter: true,
  },
  {
    key: 'area',
    value: (v) => v.measurements.FLOOR_AREA,
    format: (v, locale) => formatArea(v.measurements.FLOOR_AREA, locale),
    higherIsBetter: true,
  },
  {
    key: 'rooms',
    value: (v) => v.measurements.ROOM_COUNT,
    format: (v) => String(v.measurements.ROOM_COUNT),
    higherIsBetter: true,
  },
  {
    key: 'price',
    value: (v) => v.estimateTotal,
    format: (v, locale) => formatSumShort(v.estimateTotal, locale),
    higherIsBetter: false,
  },
  {
    key: 'perSquare',
    value: (v) => v.perSquareMeter,
    format: (v, locale) => formatSumShort(v.perSquareMeter, locale),
    higherIsBetter: false,
  },
  {
    key: 'issues',
    value: (v) => v.issues.filter((issue) => issue.severity === 'error').length,
    format: (v) => String(v.issues.filter((issue) => issue.severity === 'error').length),
    higherIsBetter: false,
  },
];

interface Props {
  variants: Variant[];
  onOpen: (variant: Variant) => void;
  onClose: () => void;
  onRemove: (id: string) => void;
}

export function VariantCompare({ variants, onOpen, onClose, onRemove }: Props) {
  const t = useTranslations('results.compareBlock');
  const locale = useLocale();

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-medium">{t('title', { count: variants.length })}</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="size-4" />
          {t('close')}
        </Button>
      </div>

      {/* Keng jadval sahifani emas, o'zini suradi. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-32" />
              {variants.map((variant) => (
                <th key={variant.id} className="p-2 align-top">
                  <div className="flex flex-col gap-2">
                    <PlanCover svg={variant.coverSvg} />
                    <p className="truncate text-sm font-medium">{variant.skeletonName}</p>
                    <div className="flex items-center justify-center gap-1">
                      <Button size="sm" onClick={() => onOpen(variant)}>
                        {t('open')}
                        <ArrowRight className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onRemove(variant.id)}>
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {ROWS.map((row) => {
              /*
                Eng yaxshisi ajratib ko'rsatiladi. Hammasi teng bo'lsa
                hech biri belgilanmaydi — aks holda "eng yaxshi" degan
                belgi ma'nosini yo'qotardi.
              */
              const values = variants.map(row.value);
              const best = row.higherIsBetter ? Math.max(...values) : Math.min(...values);
              const unique = new Set(values).size > 1;

              return (
                <tr key={row.key} className="border-t">
                  <th className="p-2 text-start font-normal text-muted-foreground">
                    {t(`rows.${row.key}` as never)}
                  </th>

                  {variants.map((variant) => (
                    <td
                      key={variant.id}
                      className={cn(
                        'p-2 text-center font-mono tabular-nums',
                        unique && row.value(variant) === best && 'font-semibold text-primary',
                      )}
                    >
                      {row.format(variant, locale)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
