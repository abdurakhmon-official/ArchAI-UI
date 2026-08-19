import { generateVariants, type SkeletonRow, type StyleConfig } from '@/lib/shared/generate';
import type { PriceBook } from '@/lib/shared/pricing';
import type { RoomTypeRule } from '@/lib/geometry/types';
import type { GenerateParams, Style } from '@/types/domain';

export function toStyleConfig(style: Style): StyleConfig {
  const roof = (style.roof ?? {}) as Record<string, unknown>;
  const interior = (style.interior ?? {}) as { ceilingHeight?: number };
  const layout = (style.layout_rules ?? {}) as Record<string, unknown>;
  const window = (style.window ?? {}) as { wallAreaRatio?: number };

  const preset = style.roof_style;

  return {
    id: style.id,
    slug: style.slug,
    roof: preset
      ? {
          type: preset.family,
          pitch: preset.pitch,
          overhang: preset.overhang,
          ...(preset.upper_pitch !== null ? { upperPitch: preset.upper_pitch } : {}),
          ...(preset.break_ratio !== null ? { breakRatio: preset.break_ratio } : {}),
        }
      : {
          type: (roof.type as StyleConfig['roof']['type']) ?? 'gable',
          pitch: (roof.pitch as number) ?? 25,
          overhang: (roof.overhang as number) ?? 0.5,
        },
    layout: {
      corridorWidth: (layout.corridorWidth as number) ?? 1.4,
      openKitchen: (layout.openKitchen as boolean) ?? false,
      minAreaFactor: (layout.minAreaFactor as number) ?? 1,
      ceilingHeight: interior.ceilingHeight ?? 2.8,
      windowWallAreaRatio: window.wallAreaRatio ?? 0.15,
    },
    facade: (style.facade ?? {}) as Record<string, unknown>,
    window: (style.window ?? {}) as Record<string, unknown>,
    interior: (style.interior ?? {}) as Record<string, unknown>,
  };
}

export interface PreviewInput {
  params: GenerateParams;
  skeletons: SkeletonRow[];
  styles: Style[];
  rules: Record<string, RoomTypeRule>;
  names: Record<string, string>;
  book: PriceBook;
}

export function previewVariant(input: PreviewInput) {
  const { params, skeletons, styles, rules, names, book } = input;

  const chosen = params.styleSlug
    ? styles.filter((style) => style.slug === params.styleSlug)
    : styles;

  if (chosen.length === 0 || skeletons.length === 0 || Object.keys(rules).length === 0) {
    return null;
  }

  const result = generateVariants(
    {
      width: params.width,
      length: params.length,
      floors: params.floors,
      rooms: params.rooms,
      garage: params.garage,
      extras: params.extras,
      variants: 1,
      styleSlug: params.styleSlug,
    },
    skeletons,
    chosen.map(toStyleConfig),
    { rules, names, book },
  );

  return result.variants[0] ?? null;
}
