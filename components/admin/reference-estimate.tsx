'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { buildHouse } from '@/lib/geometry';
import type { RoomTypeRule, TreeNode } from '@/lib/geometry/types';
import { computeEstimate } from '@/lib/shared/pricing';
import { formatDecimal, translated } from '@/lib/formatters';
import { toBook } from '@/lib/price-book';
import { cn } from '@/lib/utils';
import type { AdminPriceItem } from '@/lib/services';

/**
 * Etalon uy — narx o'zgarishining natijasini saqlashdan OLDIN ko'rsatadi.
 *
 * Busiz admin raqamlarni ko'r-ko'rona o'zgartiradi va natijani faqat
 * foydalanuvchi shikoyat qilganda biladi. Hisob `lib/shared/pricing.ts`
 * bilan — serverdagi bilan aynan bir xil kod, `sync:geometry` orqali
 * nusxalanadi. Ya'ni bu yerdagi son haqiqiy smetada chiqadigan son.
 *
 * Uy o'zgarmas: 12 × 10 m, 1 qavat. Maqsad chiroyli reja emas, balki
 * narx o'zgarishini bir xil o'lchov bilan solishtirish.
 */

/** Etalon uy — o'zgarmas, shunda taqqoslash ma'noli bo'ladi. */
const BOUNDS = { x: 0, y: 0, width: 12, length: 10 };

const TREE: TreeNode = {
  kind: 'split',
  id: 'n1',
  axis: 'vertical',
  ratio: 0.56,
  children: [
    {
      kind: 'split',
      id: 'n2',
      axis: 'horizontal',
      ratio: 0.6,
      children: [
        { kind: 'leaf', id: 'r1', roomType: 'living' },
        { kind: 'leaf', id: 'r2', roomType: 'kitchen' },
      ],
    },
    {
      kind: 'split',
      id: 'n3',
      axis: 'horizontal',
      ratio: 0.4,
      children: [
        { kind: 'leaf', id: 'r3', roomType: 'bedroom' },
        { kind: 'leaf', id: 'r4', roomType: 'bathroom' },
      ],
    },
  ],
};

interface Props {
  items: AdminPriceItem[];
  /** Tahrirlanayotgan, hali saqlanmagan narxlar: `{ itemCode: narx }`. */
  draft: Record<string, number>;
  rules: Record<string, RoomTypeRule>;
  finishDefaults?: Record<string, string>;
  className?: string;
}

export function ReferenceEstimate({ items, draft, rules, finishDefaults = {}, className }: Props) {
  const t = useTranslations('admin.prices');
  const locale = useLocale();

  const house = useMemo(() => {
    if (!Object.keys(rules).length) return null;

    return buildHouse({ bounds: BOUNDS, floors: [{ level: 1, tree: TREE }] }, { rules }).house;
  }, [rules]);

  /** Saqlangan narxlar bilan — taqqoslash uchun asos. */
  const saved = useMemo(() => toBook(items, { finishDefaults }), [items, finishDefaults]);
  /** Tahrirdagi narxlar bilan. */
  const edited = useMemo(
    () => toBook(items, { draft, finishDefaults }),
    [items, draft, finishDefaults],
  );

  if (!house) {
    return <div className={cn('h-64 animate-pulse rounded-xl border bg-muted/30', className)} />;
  }

  const before = computeEstimate(house, saved);
  const after = computeEstimate(house, edited);
  const delta = after.total - before.total;
  const changed = Math.abs(delta) > 0.5;

  return (
    <div className={cn('flex flex-col gap-4 rounded-xl border bg-card p-4', className)}>
      <div>
        <h2 className="text-sm font-medium">{t('reference')}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{t('referenceHint')}</p>
      </div>

      <div>
        <p className="font-mono text-2xl font-semibold tabular-nums">
          {formatDecimal(after.total, { locale })}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDecimal(after.perSquareMeter, { locale })} {t('perSquareMeter')}
        </p>
      </div>

      {/* Farq faqat o'zgarish bo'lganda — aks holda diqqatni chalg'itadi. */}
      {changed ? (
        <p
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium tabular-nums',
            delta > 0 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
          )}
        >
          {delta > 0 ? '+' : '−'}
          {formatDecimal(Math.abs(delta), { locale })}
          <span className="ms-1 font-normal opacity-80">
            ({delta > 0 ? '+' : '−'}
            {Math.abs(Math.round((delta / (before.total || 1)) * 100))}%)
          </span>
        </p>
      ) : null}

      <ul className="flex flex-col gap-1.5 border-t pt-3 text-sm">
        {after.categories.slice(0, 5).map((category) => (
          <li key={category.category} className="flex items-center justify-between gap-2">
            <span className="truncate text-muted-foreground">
              {t(`categories.${category.category}` as never)}
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums">
              {Math.round(category.share * 100)}%
            </span>
          </li>
        ))}
      </ul>

      {after.warnings.length > 0 ? (
        <ul className="flex flex-col gap-1 border-t pt-3">
          {after.warnings.map((warning) => (
            <li key={warning} className="text-xs text-destructive">
              {warning}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------

/** Foydalanuvchiga ko'rinadigan nom — jadval ham shundan foydalanadi. */
export function itemName(item: AdminPriceItem, locale: string): string {
  return translated(item.name, locale) || item.code;
}
