'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { priceAdminService } from '@/lib/services';
import type { Translated } from '@/types/domain';

const usePriceItems = () => {
  return useQuery({
    queryKey: queryKeys.priceItems,
    queryFn: priceAdminService.items,
    staleTime: 30_000,
  });
};

const usePriceImpact = () => {
  return useQuery({
    queryKey: queryKeys.priceImpact,
    queryFn: priceAdminService.impact,
    staleTime: 5 * 60_000,
  });
};

const useFinishPresets = () => {
  return useQuery({
    queryKey: queryKeys.finishLevels,
    queryFn: priceAdminService.finishLevels,
    staleTime: 30_000,
  });
};

const useInvalidatePrices = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.priceItems });
    queryClient.invalidateQueries({ queryKey: queryKeys.finishLevels });
  };
};

const useUpdatePriceItem = () => {
  const invalidate = useInvalidatePrices();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      unitPrice?: number;
      sort?: number;
      active?: boolean;
    }) => priceAdminService.updateItem(id, input),
    onSuccess: invalidate,
  });
};

const useCreateOption = () => {
  const invalidate = useInvalidatePrices();

  return useMutation({
    mutationFn: ({
      itemId,
      ...input
    }: {
      itemId: string;
      code: string;
      name: Translated;
      unitPrice: number;
    }) => priceAdminService.createOption(itemId, input),
    onSuccess: invalidate,
  });
};

const useUpdateOption = () => {
  const invalidate = useInvalidatePrices();

  return useMutation({
    mutationFn: ({
      optionId,
      ...input
    }: {
      optionId: string;
      unitPrice?: number;
      name?: Translated;
      active?: boolean;
    }) => priceAdminService.updateOption(optionId, input),
    onSuccess: invalidate,
  });
};

const useDeleteOption = () => {
  const invalidate = useInvalidatePrices();

  return useMutation({
    mutationFn: (optionId: string) => priceAdminService.deleteOption(optionId),
    onSuccess: invalidate,
  });
};

const useUpdateFinishPreset = () => {
  const invalidate = useInvalidatePrices();

  return useMutation({
    mutationFn: ({ code, defaults }: { code: string; defaults: Record<string, string> }) =>
      priceAdminService.updateFinishLevel(code, defaults),
    onSuccess: invalidate,
  });
};

export {
  usePriceItems,
  usePriceImpact,
  useFinishPresets,
  useUpdatePriceItem,
  useCreateOption,
  useUpdateOption,
  useDeleteOption,
  useUpdateFinishPreset,
};
