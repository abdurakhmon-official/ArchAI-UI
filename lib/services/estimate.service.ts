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

// --- Smeta -----------------------------------------------------------------

export const estimateService = {
  calculate(geometry: GeometryState, finishLevel: string, selection?: EstimateSelection) {
    return unwrap<EstimateResult>(api.post('/estimate', { geometry, finishLevel, selection }));
  },

  finishLevels() {
    return unwrap<FinishLevel[]>(api.get('/estimate/finish-levels'));
  },

  /**
   * Materiallar katalogi — kirgan foydalanuvchi uchun ochiq.
   *
   * Admin ro'yxatidan (`/price-items`) farqi: bu yerda faqat faol
   * bandlar va faol materiallar keladi. Admin nofaol qilgan material
   * foydalanuvchiga umuman ko'rinmasligi kerak.
   */
  priceItems() {
    return unwrap<CatalogPriceItem[]>(api.get('/estimate/price-items'));
  },
};

/**
 * Foydalanuvchining o'z narxlari.
 *
 * Materiallar tanlovi loyihaga bog'langan edi: o'z pudratchisining
 * narxlarini biladigan odam har yangi loyihada ularni qaytadan
 * kiritardi.
 */
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

// --- Admin: narx bazasi -----------------------------------------------------

export interface AdminPriceOption {
  id: string;
  code: string;
  name: Translated;
  description: Translated | null;
  /** Prisma `Decimal` — SATR bo'lib keladi. */
  unit_price: string;
  image_url: string | null;
  sort: number;
  active: boolean;
}

export interface AdminPriceItem {
  id: string;
  code: string;
  category: string;
  name: Translated;
  unit: string;
  unit_price: string;
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

  updateItem(id: string, input: { unit_price?: number; sort?: number; active?: boolean }) {
    return unwrap<AdminPriceItem>(api.put(`/price-items/${id}`, input));
  },

  createOption(
    itemId: string,
    input: { code: string; name: Translated; unit_price: number; sort?: number },
  ) {
    return unwrap<AdminPriceOption>(api.post(`/price-items/${itemId}/options`, input));
  },

  updateOption(optionId: string, input: { unit_price?: number; name?: Translated; active?: boolean }) {
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
