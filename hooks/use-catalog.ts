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

const useRoomTypes = () => {
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
          minArea: row.minArea,
          maxArea: row.maxArea,
          idealRatio: row.idealRatio,
          needsExteriorWall: row.needsExteriorWall,
          isWetZone: row.isWetZone,
          accessFrom: row.accessFrom,
        },
      ]),
    );
  }, [query.data]);

  const names = useMemo<Record<string, string>>(() => {
    if (!query.data) return {};
    return Object.fromEntries(query.data.map((row) => [row.code, translated(row.name, locale)]));
  }, [query.data, locale]);

  return { ...query, rules, names, roomTypes: query.data ?? [] };
};

const useSelectableRoomTypes = () => {
  const query = useQuery({
    queryKey: queryKeys.selectableRoomTypes,
    queryFn: catalogService.selectableRoomTypes,
    staleTime: 30 * 60_000,
  });

  const limits = useMemo<RoomTypeLimit[]>(
    () =>
      (query.data ?? []).map((type) => ({
        code: type.code,
        minArea: type.minArea,
        maxCount: type.maxCount,
        defaultCount: type.defaultCount,
      })),
    [query.data],
  );

  const defaults = useMemo<Record<string, number>>(() => {
    const result: Record<string, number> = {};
    for (const type of limits) {
      if (type.defaultCount > 0) result[type.code] = type.defaultCount;
    }
    return result;
  }, [limits]);

  return { ...query, limits, defaults };
};

const useStyles = () => {
  return useQuery({
    queryKey: queryKeys.styles,
    queryFn: catalogService.styles,
    staleTime: 30 * 60_000,
  });
};

const useFinishLevels = () => {
  return useQuery({
    queryKey: queryKeys.finishLevels,
    queryFn: estimateService.finishLevels,
    staleTime: 30 * 60_000,
  });
};

const usePriceBook = (finishLevel: string, enabled = true) => {
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
};

export { useRoomTypes, useSelectableRoomTypes, useStyles, useFinishLevels, usePriceBook };
