import { buildHouse, pickStairs } from '@/lib/geometry';
import { toStyleConfig } from '@/lib/generate';
import type { House, LayoutRules, Rect, RoofSpec, RoomTypeRule, TreeNode } from '@/lib/geometry/types';
import type { GeometryState, Style } from '@/types/domain';

const DEFAULT_ROOF: RoofSpec = { type: 'gable', pitch: 25, overhang: 0.5 };

export interface HouseOptions {
  rules: Record<string, RoomTypeRule>;
  style?: Style | null;
}

export function houseFrom(geometry: GeometryState, options: HouseOptions): House {
  const bounds = geometry.bounds as Rect;

  const trees = [...geometry.floors]
    .sort((first, second) => first.level - second.level)
    .map((floor) => floor.tree as TreeNode);

  const stairs = trees.length > 1 ? pickStairs(trees[0], bounds) : undefined;
  const { roof, layout } = styleConfig(options.style);

  const { house } = buildHouse(
    {
      bounds,
      floors: trees.map((tree, index) => ({ level: index + 1, tree, stairs })),
      roof,
      extras: geometry.extras,
    },
    { rules: options.rules, layout },
  );

  return house;
}

function styleConfig(style?: Style | null): { roof: RoofSpec; layout: Partial<LayoutRules> } {
  if (!style) return { roof: DEFAULT_ROOF, layout: {} };

  const config = toStyleConfig(style);
  return { roof: config.roof, layout: config.layout };
}
