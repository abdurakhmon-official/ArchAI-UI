import type { Issue, Measurements, Rect, TreeNode } from '@/lib/geometry/types';
import type { EstimateResult, EstimateSelection } from '@/lib/shared/pricing';

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

export type Translated = Record<string, string>;

export type {
  EstimateLine,
  EstimateResult,
  EstimateSelection,
  LineSelection,
  PriceCategory,
  PriceSource,
} from '@/lib/shared/pricing';

export interface FinishLevel {
  id: string;
  code: string;
  name: Translated;
  defaults: Record<string, string>;
  sort: number;
}

export type RoofFamily = 'flat' | 'shed' | 'gable' | 'hip' | 'pyramid' | 'mansard';

export interface RoofStyle {
  id: string;
  code: string;
  name: Translated;
  family: RoofFamily;
  pitch: number;
  overhang: number;
  upper_pitch: number | null;
  break_ratio: number | null;
  covering_id: string | null;
  covering?: { code: string; name: Translated; unit_price: string } | null;
  color: string | null;
  preview_url: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sort: number;
  _count?: { styles: number };
}

export interface Style {
  id: string;
  slug: string;
  roof_style_id?: string | null;
  roof_style?: RoofStyle | null;
  name: Translated;
  description?: Translated;
  roof: Record<string, unknown>;
  facade: Record<string, unknown>;
  window: Record<string, unknown>;
  interior: Record<string, unknown>;
  layout_rules: Record<string, unknown>;
  preview_url: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sort?: number;
}

export interface RoomType {
  id: string;
  code: string;
  name: Translated;
  min_area: number;
  max_area: number;
  ideal_ratio: number;
  needs_exterior_wall: boolean;
  is_wet_zone: boolean;
  access_from: string[];
  selectable: boolean;
  max_count: number;
  default_count: number;
  sort: number;
}

export interface SelectableRoomType {
  code: string;
  name: Translated;
  min_area: number;
  max_count: number;
  default_count: number;
  selectable: boolean;
  sort: number;
}

export interface Skeleton {
  id: string;
  name: string;
  floors: number;
  tree: { floors: { level: number; tree: TreeNode }[] };
  tag_bedrooms: number[];
  tag_styles: string[];
  min_width: number;
  max_width: number;
  min_length: number;
  max_length: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export interface SkeletonInput {
  name: string;
  floors: number;
  tree: { floors: { level: number; tree: TreeNode }[] };
  tag_bedrooms: number[];
  tag_styles: string[];
  min_width: number;
  max_width: number;
  min_length: number;
  max_length: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface ProjectSummary {
  id: string;
  title: string;
  note: string | null;
  cover_svg: string | null;
  estimate_total: string | null;
  finish_level: string;
  created_at: string;
  updated_at: string;
  style: { slug: string; name: Translated } | null;
}

export interface AdminProject extends ProjectSummary {
  deleted_at: string | null;
  user: { id: string; fullName: string; email: string } | null;
}

export type MediaType = 'IMAGE' | 'MODEL' | 'DOCUMENT';

export interface MediaFile {
  id: string;
  type: MediaType;
  url: string;
  key: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
  uploader: { fullName: string; email: string } | null;
}

export interface OrphanFile {
  id: string;
  url: string;
  key: string;
  size: number;
  original_name: string;
}

export interface Project extends ProjectSummary {
  geometry: GeometryState;
  params: GenerateParams;
  estimate: EstimateResult | null;
  estimate_selection: EstimateSelection | null;
}

/** Loyihadan generatsiya qilingan fayl — PDF yoki 3D rasm. */
export interface ProjectExportRow {
  id: string;
  kind: 'PDF' | 'RENDER' | 'DWG';
  storage_key: string;
  size_bytes: number | null;
  watermark: boolean;
  expires_at: string | null;
  created_at: string;
  project: { id: string; title: string; user: { email: string } | null } | null;
}

export interface PriceProfile {
  id: string;
  name: string;
  selection: EstimateSelection;
  created_at: string;
  updated_at: string;
}

/** Ulashilgan loyiha — egasi va ichki identifikatorlarsiz. */
export interface SharedProject {
  title: string;
  note: string | null;
  geometry: GeometryState;
  params: GenerateParams;
  estimate: EstimateResult | null;
  estimate_total: string | null;
  finish_level: string;
  cover_svg: string | null;
  created_at: string;
  style: { slug: string; name: Translated } | null;
}

export interface ProjectVersion {
  id: string;
  label: string | null;
  estimate_total: string | null;
  created_at: string;
}

export interface PlanLimits {
  projects: number;
  variants: number;
  versions: number;
  pdf: boolean;
  dwg: boolean | 'on_request';
  interior: boolean;
  edit: boolean;
  watermark: boolean;
}

export interface Plan {
  id: string;
  code: string;
  name: Translated;
  description?: Translated;
  price_uzs: string;
  price_usd: string;
  limits: PlanLimits;
  sort: number;
}

export type PaymentProvider = 'PAYME' | 'CLICK' | 'STRIPE';

export interface ProviderStatus {
  code: PaymentProvider;
  ready: boolean;
  currency: 'UZS' | 'USD';
}

export interface Subscription {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  provider: PaymentProvider | null;
  period_start: string | null;
  period_end: string | null;
  auto_renew: boolean;
  plan: Plan;
}

export interface Payment {
  id: string;
  provider: PaymentProvider;
  amount: string;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELED';
  paid_at: string | null;
  created_at: string;
}

export interface JobStatus {
  id: string;
  queue: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'unknown';
  progress: number;
  url?: string;
  error?: string;
}

export interface ExportRequest {
  ready: boolean;
  url?: string;
  jobId?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: Translated;
  excerpt?: Translated;
  cover_url: string | null;
  views: number;
  published_at: string | null;
  category: { slug: string; name: Translated } | null;
  author: { fullName: string } | null;
}

export interface BlogPostDetail extends BlogPost {
  body: Translated;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  created_at: string;
  category_id: string | null;
}

export interface BlogCategory {
  id: string;
  slug: string;
  name: Translated;
  _count?: { posts: number };
}

export interface FaqGroup {
  category: string;
  questions: FaqItem[];
}

export interface AdminBlogPost extends BlogPost {
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  created_at: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: Translated;
  answer: Translated;
  sort: number;
  active: boolean;
}

export type LeadStatus = 'NEW' | 'IN_PROGRESS' | 'CONTACTED' | 'CLOSED' | 'SPAM';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  message: string | null;
  source: string;
  status: LeadStatus;
  admin_note: string | null;
  created_at: string;
}
