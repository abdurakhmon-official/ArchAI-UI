import type { PriceBook, PriceCategory } from '@/lib/shared/pricing';
import { toNumber } from '@/lib/formatters';

export interface CatalogPriceItem {
  id: string;
  code: string;
  category: string;
  name: unknown;
  unit: string;
  unit_price: string | number;
  measure: string;
  sort: number;
  active: boolean;
  options: CatalogPriceOption[];
}

export interface CatalogPriceOption {
  id: string;
  code: string;
  name: unknown;
  description: unknown;
  unit_price: string | number;
  image_url: string | null;
  sort: number;
  active: boolean;
}

export interface BookOptions {
  draft?: Record<string, number>;
  finishDefaults?: Record<string, string>;
  finishLevel?: string;
}

export function toBook(items: CatalogPriceItem[], options: BookOptions = {}): PriceBook {
  const { draft = {}, finishDefaults = {}, finishLevel = 'standard' } = options;

  return {
    lines: items
      .filter((item) => item.active)
      .map((item) => ({
        code: item.code,
        category: item.category as PriceCategory,
        name: item.name,
        unit: item.unit,
        unitPrice: draft[item.code] ?? toNumber(item.unit_price),
        measure: item.measure,
        sort: item.sort,
        options: item.options
          .filter((option) => option.active)
          .map((option) => ({
            code: option.code,
            name: option.name,
            description: option.description,
            unitPrice: draft[`${item.code}:${option.code}`] ?? toNumber(option.unit_price),
            imageUrl: option.image_url,
            sort: option.sort,
          })),
      })),
    finishDefaults,
    finishLevel,
  };
}
