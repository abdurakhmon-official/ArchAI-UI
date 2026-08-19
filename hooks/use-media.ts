'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { mediaService } from '@/lib/services';

export function useMedia(query: { page?: number; type?: string; search?: string } = {}) {
  return useQuery({
    queryKey: [...queryKeys.media, query],
    queryFn: () => mediaService.list({ limit: 24, ...query }),
    staleTime: 15_000,
  });
}

export function useOrphans(days: number, enabled: boolean) {
  return useQuery({
    queryKey: [...queryKeys.media, 'orphans', days],
    queryFn: () => mediaService.orphans(days),
    enabled,
    staleTime: 0,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.media });
}

export function useDeleteMedia() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => mediaService.remove(id),
    onSuccess: invalidate,
  });
}

export function usePurgeOrphans() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (days: number) => mediaService.purgeOrphans(days),
    onSuccess: invalidate,
  });
}
