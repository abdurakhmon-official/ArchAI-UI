import type { Issue, Measurements, Rect, TreeNode } from '@/lib/geometry/types';

export type ExtraKind = 'garage' | 'terrace' | 'balcony' | 'basement' | 'sauna' | 'pool';

export interface ExtraRequest {
  kind: ExtraKind;
  count?: number;
}

export interface GeometryState {
  bounds: Rect;
  floors: { level: number; tree: TreeNode }[];
  styleSlug?: string;
  extras: ExtraRequest[];
}

export interface RoomSummary {
  id: string;
  roomType: string;
  area: number;
  ratio: number;
}

export interface Variant {
  id: string;
  skeletonId: string;
  skeletonName: string;
  styleSlug: string;
  geometry: GeometryState;
  floors: { level: number; tree: TreeNode; rooms: RoomSummary[] }[];
  score: number;
  issues: Issue[];
  measurements: Measurements;
  estimateTotal: number;
  perSquareMeter: number;
  coverSvg: string;
  extras: { kind: string; area: number; side: string | null }[];
  skippedExtras: { kind: string; reason: string }[];
  steps: {
    corridorsAdded: number;
    rebalanced: boolean;
    roomsAdded: number;
    roomsRemoved: number;
    skipped: SkippedRoom[];
  };
  scoreParts?: {
    plan: number;
    fit: number;
    errors: number;
    warnings: number;
    /** Yo'nalish bali. Yo'nalish berilmagan bo'lsa `null`. */
    orientation?: number | null;
  };
  /** Qaysi xona qaysi tomonga qaragani. Yo'nalish berilmasa bo'sh. */
  orientation?: OrientationNote[];
}

export interface OrientationNote {
  roomId: string;
  roomType: string;
  facing: string[];
  preferred: string[];
  ok: boolean;
}

export interface SkippedRoom {
  roomType: string;
  wanted: number;
  placed: number;
  reason: 'NO_SPACE' | 'LIMIT' | 'FAILED';
}

export interface GenerateParams {
  landAreaSotix: number;
  width: number;
  length: number;
  floors: number;
  rooms: Record<string, number>;
  kitchen: 'separate' | 'combined';
  garage: number;
  extras: string[];
  styleSlug?: string;
  northSide?: 'north' | 'east' | 'south' | 'west';
  variants?: number;
  finishLevel?: string;
}

export interface GenerateResult {
  variants: Variant[];
  count: number;
  relaxed: boolean;
  /** Translation code, rendered through `serverMessages`. */
  message?: string;
  messageValues?: Record<string, string | number>;
  variantLimit: number;
}

export interface JobStatus {
  id: string;
  queue: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'unknown';
  progress: number;
  url?: string;
  error?: string;
}
