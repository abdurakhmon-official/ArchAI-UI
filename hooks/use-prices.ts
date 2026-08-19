'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { priceAdminService } from '@/lib/services';
import type { Translated } from '@/types/domain';

export function usePriceItems() {
  return useQuery({
    queryKey: queryKeys.priceItems,
    queryFn: priceAdminService.items,
    staleTime: 30_000,
  });
}

export function usePriceImpact() {
  return useQuery({
    queryKey: queryKeys.priceImpact,
    queryFn: priceAdminService.impact,
    staleTime: 5 * 60_000,
  });
}

export function useFinishPresets() {
  return useQuery({
    queryKey: queryKeys.finishLevels,
    queryFn: priceAdminService.finishLevels,
    staleTime: 30_000,
  });
}

function useInvalidatePrices() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.priceItems });
    queryClient.invalidateQueries({ queryKey: queryKeys.finishLevels });
  };
}

export function useUpdatePriceItem() {
  const invalidate = useInvalidatePrices();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      unit_price?: number;
      sort?: number;
      active?: boolean;
    }) => priceAdminService.updateItem(id, input),
    onSuccess: invalidate,
  });
}

export function useCreateOption() {
  const invalidate = useInvalidatePrices();

  return useMutation({
    mutationFn: ({
      itemId,
      ...input
    }: {
      itemId: string;
      code: string;
      name: Translated;
      unit_price: number;
    }) => priceAdminService.createOption(itemId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateOption() {
  const invalidate = useInvalidatePrices();

  return useMutation({
    mutationFn: ({
      optionId,
      ...input
    }: {
      optionId: string;
      unit_price?: number;
      name?: Translated;
      active?: boolean;
    }) => priceAdminService.updateOption(optionId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteOption() {
  const invalidate = useInvalidatePrices();

  return useMutation({
    mutationFn: (optionId: string) => priceAdminService.deleteOption(optionId),
    onSuccess: invalidate,
  });
}

export function useUpdateFinishPreset() {
  const invalidate = useInvalidatePrices();

  return useMutation({
    mutationFn: ({ code, defaults }: { code: string; defaults: Record<string, string> }) =>
      priceAdminService.updateFinishLevel(code, defaults),
    onSuccess: invalidate,
  });
}
