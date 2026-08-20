import type { EstimateSelection } from '@/lib/shared/pricing';
import type { Translated } from './common';

export interface FinishLevel {
  id: string;
  code: string;
  name: Translated;
  defaults: Record<string, string>;
  sort: number;
}

export interface PriceProfile {
  id: string;
  name: string;
  selection: EstimateSelection;
  createdAt: string;
  updatedAt: string;
}

export type {
  EstimateLine,
  EstimateResult,
  EstimateSelection,
  LineSelection,
  PriceCategory,
  PriceSource,
} from '@/lib/shared/pricing';
