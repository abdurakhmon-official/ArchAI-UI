import api from '@/lib/axios';
import type { CatalogPriceItem } from '@/lib/price-book';
import { unwrap } from '@/lib/services/unwrap';
import type {
  EstimateResult,
  EstimateSelection,
  FinishLevel,
  GeometryState,
  PriceProfile,
  Translated,
} from '@/types/domain';

export const estimateService = {
  calculate(geometry: GeometryState, finishLevel: string, selection?: EstimateSelection) {
    return unwrap<EstimateResult>(api.post('/estimate', { geometry, finishLevel, selection }));
  },

  finishLevels() {
    return unwrap<FinishLevel[]>(api.get('/estimate/finish-levels'));
  },

  priceItems() {
    return unwrap<CatalogPriceItem[]>(api.get('/estimate/price-items'));
  },
};

export const priceProfileService = {
  list() {
    return unwrap<PriceProfile[]>(api.get('/price-profiles'));
  },

  create(input: { name: string; selection: EstimateSelection }) {
    return unwrap<PriceProfile>(api.post('/price-profiles', input));
  },

  update(id: string, input: { name: string; selection: EstimateSelection }) {
    return unwrap<PriceProfile>(api.put(`/price-profiles/${id}`, input));
  },

  remove(id: string) {
    return api.delete(`/price-profiles/${id}`);
  },
};

export interface AdminPriceOption {
  id: string;
  code: string;
  name: Translated;
  description: Translated | null;
  unitPrice: string;
  imageUrl: string | null;
  sort: number;
  active: boolean;
}

export interface AdminPriceItem {
  id: string;
  code: string;
  category: string;
  name: Translated;
  unit: string;
  unitPrice: string;
  measure: string;
  sort: number;
  active: boolean;
  options: AdminPriceOption[];
}

export interface FinishPreset {
  id: string;
  code: string;
  name: Translated;
  defaults: Record<string, string>;
  sort: number;
}

export const priceAdminService = {
  items() {
    return unwrap<AdminPriceItem[]>(api.get('/price-items'));
  },

  impact() {
    return unwrap<{ projects: number; withOwnSelection: number }>(api.get('/price-items/impact'));
  },

  updateItem(id: string, input: { unitPrice?: number; sort?: number; active?: boolean }) {
    return unwrap<AdminPriceItem>(api.put(`/price-items/${id}`, input));
  },

  createOption(
    itemId: string,
    input: { code: string; name: Translated; unitPrice: number; sort?: number },
  ) {
    return unwrap<AdminPriceOption>(api.post(`/price-items/${itemId}/options`, input));
  },

  updateOption(optionId: string, input: { unitPrice?: number; name?: Translated; active?: boolean }) {
    return unwrap<AdminPriceOption>(api.put(`/price-items/options/${optionId}`, input));
  },

  deleteOption(optionId: string) {
    return api.delete(`/price-items/options/${optionId}`);
  },

  finishLevels() {
    return unwrap<FinishPreset[]>(api.get('/finish-levels'));
  },

  updateFinishLevel(code: string, defaults: Record<string, string>) {
    return unwrap<FinishPreset>(api.put(`/finish-levels/${code}`, { defaults }));
  },
};
