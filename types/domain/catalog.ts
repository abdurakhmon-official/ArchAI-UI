import type { TreeNode } from '@/lib/geometry/types';
import type { Translated } from './common';

export type RoofFamily = 'flat' | 'shed' | 'gable' | 'hip' | 'pyramid' | 'mansard';

export interface RoofStyle {
  id: string;
  code: string;
  name: Translated;
  family: RoofFamily;
  pitch: number;
  overhang: number;
  upperPitch: number | null;
  breakRatio: number | null;
  coveringId: string | null;
  covering?: { code: string; name: Translated; unitPrice: string } | null;
  color: string | null;
  previewUrl: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sort: number;
  _count?: { styles: number };
}

export interface Style {
  id: string;
  slug: string;
  roofStyleId?: string | null;
  roofStyle?: RoofStyle | null;
  name: Translated;
  description?: Translated;
  roof: Record<string, unknown>;
  facade: Record<string, unknown>;
  window: Record<string, unknown>;
  interior: Record<string, unknown>;
  layoutRules: Record<string, unknown>;
  previewUrl: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sort?: number;
}

export interface RoomType {
  id: string;
  code: string;
  name: Translated;
  minArea: number;
  maxArea: number;
  idealRatio: number;
  needsExteriorWall: boolean;
  isWetZone: boolean;
  accessFrom: string[];
  selectable: boolean;
  maxCount: number;
  defaultCount: number;
  sort: number;
}

export interface SelectableRoomType {
  code: string;
  name: Translated;
  minArea: number;
  maxCount: number;
  defaultCount: number;
  selectable: boolean;
  sort: number;
}

export interface Skeleton {
  id: string;
  name: string;
  floors: number;
  tree: { floors: { level: number; tree: TreeNode }[] };
  tagBedrooms: number[];
  tagStyles: string[];
  minWidth: number;
  maxWidth: number;
  minLength: number;
  maxLength: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface SkeletonInput {
  name: string;
  floors: number;
  tree: { floors: { level: number; tree: TreeNode }[] };
  tagBedrooms: number[];
  tagStyles: string[];
  minWidth: number;
  maxWidth: number;
  minLength: number;
  maxLength: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
