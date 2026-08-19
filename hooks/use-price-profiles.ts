'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { priceProfileService } from '@/lib/services';
import type { EstimateSelection } from '@/types/domain';

const KEY = ['price-profiles'] as const;

export function usePriceProfiles(enabled = true) {
  return useQuery({
    queryKey: KEY,
    queryFn: priceProfileService.list,
    enabled,
    staleTime: 60_000,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: KEY });
}

export function useSavePriceProfile() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id?: string;
      name: string;
      selection: EstimateSelection;
    }) => (id ? priceProfileService.update(id, input) : priceProfileService.create(input)),
    onSuccess: invalidate,
  });
}

export function useDeletePriceProfile() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => priceProfileService.remove(id),
    onSuccess: invalidate,
  });
}
