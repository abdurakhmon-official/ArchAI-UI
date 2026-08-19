'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { View3D } from '@/components/view3d/view-3d';
import { buildHouse, buildRoof, eaveHeightFor } from '@/lib/geometry';
import type { House, RoofSpec, TreeNode } from '@/lib/geometry/types';
import { formatArea, formatDecimal } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { RoofStyle } from '@/types/domain';

/**
 * Tom presetining jonli 3D ko'rinishi.
 *
 * Tomni raqamlar bilan tasavvur qilib bo'lmaydi: 35° va 45° orasidagi
 * farq faqat ko'rinishda bilinadi, mansardning sinish nuqtasi esa
 * umuman. Shu sababli admin surgichni surganda uy darhol qayta
 * chiziladi.
 *
 * Uy o'zgarmas (12 × 10 m, 1 qavat) — taqqoslash ma'noli bo'lishi uchun.
 * `View3D` o'zgarishsiz ishlatiladi: u faqat `house` qabul qiladi va
 * hech qanday loyiha holatini o'qimaydi.
 */

const BOUNDS = { x: 0, y: 0, width: 12, length: 10 };

const TREE: TreeNode = {
  kind: 'split',
  id: 'n1',
  axis: 'vertical',
  ratio: 0.55,
  children: [
    { kind: 'leaf', id: 'r1', roomType: 'living' },
    {
      kind: 'split',
      id: 'n2',
      axis: 'horizontal',
      ratio: 0.55,
      children: [
        { kind: 'leaf', id: 'r2', roomType: 'bedroom' },
        { kind: 'leaf', id: 'r3', roomType: 'bathroom' },
      ],
    },
  ],
};

const RULES = {
  living: { code: 'living', minArea: 16, maxArea: 45, idealRatio: 1.5, needsExteriorWall: true, isWetZone: false, accessFrom: [] },
  bedroom: { code: 'bedroom', minArea: 9, maxArea: 25, idealRatio: 1.3, needsExteriorWall: true, isWetZone: false, accessFrom: [] },
  bathroom: { code: 'bathroom', minArea: 3, maxArea: 8, idealRatio: 1.5, needsExteriorWall: false, isWetZone: true, accessFrom: [] },
};

interface Props {
  roofStyle: RoofStyle;
  className?: string;
}

export function RoofPreview({ roofStyle, className }: Props) {
  const t = useTranslations('admin.roofStyles');
  const locale = useLocale();

  const spec = useMemo<RoofSpec>(
    () => ({
      type: roofStyle.family,
      pitch: roofStyle.pitch,
      overhang: roofStyle.overhang,
      ...(roofStyle.upper_pitch !== null && roofStyle.upper_pitch !== undefined
        ? { upperPitch: roofStyle.upper_pitch }
        : {}),
      ...(roofStyle.break_ratio !== null && roofStyle.break_ratio !== undefined
        ? { breakRatio: roofStyle.break_ratio }
        : {}),
    }),
    [roofStyle],
  );

  const house = useMemo<House>(
    () =>
      buildHouse({ bounds: BOUNDS, floors: [{ level: 1, tree: TREE }], roof: spec }, { rules: RULES })
        .house,
    [spec],
  );

  /**
   * O'lchovlar `buildRoof` dan to'g'ridan-to'g'ri olinadi.
   *
   * `House` faqat `RoofSpec` ni saqlaydi, hisoblangan geometriyani
   * emas — yuza esa aynan smetaga tushadigan son, ya'ni admin uni
   * ko'rishi kerak.
   */
  const roof = useMemo(
    () =>
      buildRoof({
        bounds: BOUNDS,
        spec,
        eaveHeight: eaveHeightFor(1, house.ceilingHeight, 0.25),
      }),
    [spec, house.ceilingHeight],
  );

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <View3D house={house} />

      <dl className="grid grid-cols-3 gap-3 rounded-xl border bg-card p-4 text-sm">
        <Fact label={t('roofArea')} value={formatArea(roof.totalArea, locale)} />
        <Fact
          label={t('ridgeRise')}
          value={`${formatDecimal(roof.ridgeRise, { locale, digits: 2 })} m`}
        />
        {/*
          Faqat tom tekisliklari sanaladi. Peshtoqlar (`gables`) —
          uchburchak DEVORLAR, tom emas: `totalArea` ham ularni
          hisobga olmaydi, ya'ni ularni bu yerda qo'shish son bilan
          yuza orasida moslik yo'q degan taassurot berardi.
        */}
        <Fact label={t('planes')} value={String(roof.planes.length)} />
      </dl>

      <p className="text-xs text-muted-foreground">{t('previewHint')}</p>
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
