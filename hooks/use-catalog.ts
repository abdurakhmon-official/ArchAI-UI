'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import type { RoomTypeRule } from '@/lib/geometry/types';
import { catalogService, estimateService } from '@/lib/services';
import { queryKeys } from '@/lib/query-client';
import { toBook } from '@/lib/price-book';
import type { RoomTypeLimit } from '@/lib/constructor';
import { translated } from '@/lib/formatters';

export function useRoomTypes() {
  const locale = useLocale();

  const query = useQuery({
    queryKey: queryKeys.roomTypes,
    queryFn: catalogService.roomTypes,
    staleTime: 30 * 60_000,
  });

  const rules = useMemo<Record<string, RoomTypeRule>>(() => {
    if (!query.data) return {};

    return Object.fromEntries(
      query.data.map((row) => [
        row.code,
        {
          code: row.code,
          minArea: row.min_area,
          maxArea: row.max_area,
          idealRatio: row.ideal_ratio,
          needsExteriorWall: row.needs_exterior_wall,
          isWetZone: row.is_wet_zone,
          accessFrom: row.access_from,
        },
      ]),
    );
  }, [query.data]);

  const names = useMemo<Record<string, string>>(() => {
    if (!query.data) return {};
    return Object.fromEntries(query.data.map((row) => [row.code, translated(row.name, locale)]));
  }, [query.data, locale]);

  return { ...query, rules, names, roomTypes: query.data ?? [] };
}

export function useSelectableRoomTypes() {
  const query = useQuery({
    queryKey: queryKeys.selectableRoomTypes,
    queryFn: catalogService.selectableRoomTypes,
    staleTime: 30 * 60_000,
  });

  const limits = useMemo<RoomTypeLimit[]>(
    () =>
      (query.data ?? []).map((type) => ({
        code: type.code,
        min_area: type.min_area,
        max_count: type.max_count,
        default_count: type.default_count,
      })),
    [query.data],
  );

  const defaults = useMemo<Record<string, number>>(() => {
    const result: Record<string, number> = {};
    for (const type of limits) {
      if (type.default_count > 0) result[type.code] = type.default_count;
    }
    return result;
  }, [limits]);

  return { ...query, limits, defaults };
}

export function useStyles() {
  return useQuery({
    queryKey: queryKeys.styles,
    queryFn: catalogService.styles,
    staleTime: 30 * 60_000,
  });
}

export function useFinishLevels() {
  return useQuery({
    queryKey: queryKeys.finishLevels,
    queryFn: estimateService.finishLevels,
    staleTime: 30 * 60_000,
  });
}

export function usePriceBook(finishLevel: string, enabled = true) {
  const items = useQuery({
    queryKey: queryKeys.catalogPrices,
    queryFn: estimateService.priceItems,
    staleTime: 5 * 60_000,
    enabled,
  });

  const levels = useQuery({
    queryKey: queryKeys.finishLevels,
    queryFn: estimateService.finishLevels,
    staleTime: 30 * 60_000,
    enabled,
  });

  const book = useMemo(() => {
    if (!items.data || !levels.data) return null;

    const level = levels.data.find((row) => row.code === finishLevel);

    return toBook(items.data, {
      finishDefaults: level?.defaults ?? {},
      finishLevel,
    });
  }, [items.data, levels.data, finishLevel]);

  return { book, items: items.data ?? [], isPending: items.isPending || levels.isPending };
}
