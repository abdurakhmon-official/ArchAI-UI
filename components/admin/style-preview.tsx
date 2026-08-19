'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { View3D } from '@/components/view3d/view-3d';
import { buildHouse } from '@/lib/geometry';
import type { House, TreeNode } from '@/lib/geometry/types';
import { toStyleConfig } from '@/lib/generate';
import { appearanceOf } from '@/lib/palette';
import { cn } from '@/lib/utils';
import type { Style } from '@/types/domain';

/**
 * Uy uslubining jonli ko'rinishi.
 *
 * `RoofPreview` bilan bir xil g'oya, lekin bu yerda tom emas, RANGLAR
 * asosiy: uslubning butun ma'nosi shunda. Admin fasad rangini
 * o'zgartirganda uy darhol qayta bo'yaladi — `#EDEAE5` va `#F7F2E8`
 * orasidagi farqni raqamdan bilib bo'lmaydi.
 *
 * Uslubdan geometriya sozlamasiga o'tish `toStyleConfig` orqali —
 * generatsiya ishlatadigan AYNAN o'sha funksiya. Bu yerda tom presetini
 * tanlash tartibi qayta yozilsa, ko'rinish yolg'on gapirib qolardi.
 *
 * Uy o'zgarmas (12 × 10 m, 1 qavat): taqqoslash ma'noli bo'lishi uchun.
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
  style: Style;
  className?: string;
}

export function StylePreview({ style, className }: Props) {
  const t = useTranslations('admin.styles');

  const config = useMemo(() => toStyleConfig(style), [style]);

  const house = useMemo<House>(
    () =>
      buildHouse(
        { bounds: BOUNDS, floors: [{ level: 1, tree: TREE }], roof: config.roof },
        { rules: RULES, layout: config.layout },
      ).house,
    [config],
  );

  const appearance = useMemo(() => appearanceOf(style), [style]);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <View3D house={house} appearance={appearance} />
      <p className="text-xs text-muted-foreground">{t('previewHint')}</p>
    </div>
  );
}
