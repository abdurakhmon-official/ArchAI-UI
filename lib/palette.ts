import type { StyleAppearance } from '@/lib/shared/palette';
import type { Style } from '@/types/domain';

export function appearanceOf(style: Style | null | undefined): StyleAppearance | null {
  if (!style) return null;

  const roof = (style.roof ?? {}) as { color?: string };

  return {
    facade: (style.facade ?? {}) as StyleAppearance['facade'],
    interior: (style.interior ?? {}) as StyleAppearance['interior'],
    window: (style.window ?? {}) as StyleAppearance['window'],
    roofColor: style.roofStyle?.color ?? roof.color ?? null,
  };
}
