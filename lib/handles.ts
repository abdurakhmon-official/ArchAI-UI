import { computeRects, isLeaf, nodes } from '@/lib/geometry';
import type { Axis, Rect, SplitNode, TreeNode } from '@/lib/geometry/types';

export interface Handle {
  splitId: string;
  axis: Axis;
  from: { x: number; y: number };
  to: { x: number; y: number };
  rect: Rect;
  ratio: number;
}

export function splitHandles(tree: TreeNode, bounds: Rect): Handle[] {
  const rects = computeRects(tree, bounds);

  return nodes(tree)
    .filter((node): node is SplitNode => !isLeaf(node))
    .flatMap((node): Handle[] => {
      const rect = rects.get(node.id);
      if (!rect) return [];

      if (node.axis === 'vertical') {
        const x = rect.x + rect.width * node.ratio;
        return [
          {
            splitId: node.id,
            axis: node.axis,
            from: { x, y: rect.y },
            to: { x, y: rect.y + rect.length },
            rect,
            ratio: node.ratio,
          },
        ];
      }

      const y = rect.y + rect.length * node.ratio;
      return [
        {
          splitId: node.id,
          axis: node.axis,
          from: { x: rect.x, y },
          to: { x: rect.x + rect.width, y },
          rect,
          ratio: node.ratio,
        },
      ];
    });
}

export function ratioAt(handle: Handle, point: { x: number; y: number }): number {
  if (handle.axis === 'vertical') {
    return handle.rect.width > 0 ? (point.x - handle.rect.x) / handle.rect.width : handle.ratio;
  }

  return handle.rect.length > 0 ? (point.y - handle.rect.y) / handle.rect.length : handle.ratio;
}
