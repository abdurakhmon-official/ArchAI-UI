import type { RoomTypeRule, TreeNode } from '@/lib/geometry/types';

/**
 * Tekshiruv uchun qo'lda yozilgan uy — API ishlamasa ham 2D chizmani
 * ko'rish uchun. Bazadagi urug' ma'lumotlarining kichik nusxasi.
 */

export const BOUNDS = { x: 0, y: 0, width: 12, length: 10 };

export const GROUND_FLOOR: TreeNode = {
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
      ratio: 0.28,
      children: [
        { kind: 'leaf', id: 'r3', roomType: 'hall' },
        {
          kind: 'split',
          id: 'n4',
          axis: 'horizontal',
          ratio: 0.45,
          children: [
            { kind: 'leaf', id: 'r4', roomType: 'bathroom' },
            { kind: 'leaf', id: 'r5', roomType: 'bedroom' },
          ],
        },
      ],
    },
  ],
};

export const UPPER_FLOOR: TreeNode = {
  kind: 'split',
  id: 'm1',
  axis: 'horizontal',
  ratio: 0.45,
  children: [
    {
      kind: 'split',
      id: 'm2',
      axis: 'vertical',
      ratio: 0.5,
      children: [
        { kind: 'leaf', id: 'b1', roomType: 'bedroom' },
        { kind: 'leaf', id: 'b2', roomType: 'bedroom' },
      ],
    },
    {
      kind: 'split',
      id: 'm3',
      axis: 'vertical',
      ratio: 0.62,
      children: [
        { kind: 'leaf', id: 'b3', roomType: 'bedroom' },
        {
          kind: 'split',
          id: 'm4',
          axis: 'horizontal',
          ratio: 0.5,
          children: [
            { kind: 'leaf', id: 'b4', roomType: 'bathroom' },
            { kind: 'leaf', id: 'b5', roomType: 'office' },
          ],
        },
      ],
    },
  ],
};

export const RULES: Record<string, RoomTypeRule> = {
  living: { code: 'living', minArea: 16, maxArea: 45, idealRatio: 1.3, needsExteriorWall: true, isWetZone: false, accessFrom: ['hall', 'corridor'] },
  kitchen: { code: 'kitchen', minArea: 8, maxArea: 25, idealRatio: 1.4, needsExteriorWall: true, isWetZone: true, accessFrom: ['living', 'hall', 'corridor'] },
  bedroom: { code: 'bedroom', minArea: 9, maxArea: 28, idealRatio: 1.3, needsExteriorWall: true, isWetZone: false, accessFrom: ['corridor', 'hall'] },
  bathroom: { code: 'bathroom', minArea: 3.5, maxArea: 9, idealRatio: 1.5, needsExteriorWall: false, isWetZone: true, accessFrom: ['corridor', 'hall'] },
  hall: { code: 'hall', minArea: 4, maxArea: 14, idealRatio: 1.6, needsExteriorWall: false, isWetZone: false, accessFrom: [] },
  corridor: { code: 'corridor', minArea: 2, maxArea: 20, idealRatio: 3, needsExteriorWall: false, isWetZone: false, accessFrom: ['hall'] },
  office: { code: 'office', minArea: 6, maxArea: 18, idealRatio: 1.3, needsExteriorWall: true, isWetZone: false, accessFrom: ['corridor', 'hall'] },
};

export const NAMES: Record<string, string> = {
  living: 'Mehmonxona',
  kitchen: 'Oshxona',
  bedroom: 'Yotoqxona',
  bathroom: 'Sanuzel',
  hall: 'Kirish xonasi',
  corridor: 'Koridor',
  office: 'Ish xonasi',
};
