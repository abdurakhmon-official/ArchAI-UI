import type { EstimateResult, EstimateSelection } from '@/lib/shared/pricing';
import type { GenerateParams, GeometryState } from './generation';
import type { Translated } from './common';

export interface ProjectSummary {
  id: string;
  title: string;
  note: string | null;
  coverSvg: string | null;
  estimateTotal: string | null;
  finishLevel: string;
  createdAt: string;
  updatedAt: string;
  style: { slug: string; name: Translated } | null;
}

export interface AdminProject extends ProjectSummary {
  deletedAt: string | null;
  user: { id: string; fullName: string; email: string } | null;
}

export interface Project extends ProjectSummary {
  geometry: GeometryState;
  params: GenerateParams;
  estimate: EstimateResult | null;
  estimateSelection: EstimateSelection | null;
}

/** Loyihadan generatsiya qilingan fayl — PDF yoki 3D rasm. */
export interface ProjectExportRow {
  id: string;
  kind: 'PDF' | 'RENDER' | 'DWG';
  storageKey: string;
  sizeBytes: number | null;
  watermark: boolean;
  expiresAt: string | null;
  createdAt: string;
  project: { id: string; title: string; user: { email: string } | null } | null;
}

/** Ulashilgan loyiha — egasi va ichki identifikatorlarsiz. */
export interface SharedProject {
  title: string;
  note: string | null;
  geometry: GeometryState;
  params: GenerateParams;
  estimate: EstimateResult | null;
  estimateTotal: string | null;
  finishLevel: string;
  coverSvg: string | null;
  createdAt: string;
  style: { slug: string; name: Translated } | null;
}

export interface ProjectVersion {
  id: string;
  label: string | null;
  estimateTotal: string | null;
  createdAt: string;
}

export interface ExportRequest {
  ready: boolean;
  url?: string;
  jobId?: string;
}
