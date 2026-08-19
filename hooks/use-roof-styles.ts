'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { roofStyleService } from '@/lib/services';
import type { RoofStyle, Translated } from '@/types/domain';

export function useRoofStyles() {
  return useQuery({
    queryKey: queryKeys.roofStyles,
    queryFn: roofStyleService.listAll,
    staleTime: 30_000,
  });
}

export function useRoofFamilies() {
  return useQuery({
    queryKey: queryKeys.roofFamilies,
    queryFn: roofStyleService.families,
    staleTime: 60 * 60_000,
  });
}

function useInvalidateRoofStyles() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.roofStyles });
    queryClient.invalidateQueries({ queryKey: queryKeys.styles });
  };
}

export interface RoofStyleDraft {
  code?: string;
  name?: Translated;
  family?: string;
  pitch?: number;
  overhang?: number;
  upper_pitch?: number | null;
  break_ratio?: number | null;
  covering_id?: string | null;
  color?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sort?: number;
}

export function useCreateRoofStyle() {
  const invalidate = useInvalidateRoofStyles();

  return useMutation({
    mutationFn: (input: RoofStyleDraft & { code: string; name: Translated; family: string }) =>
      roofStyleService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateRoofStyle() {
  const invalidate = useInvalidateRoofStyles();

  return useMutation({
    mutationFn: ({ id, ...input }: RoofStyleDraft & { id: string }) =>
      roofStyleService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteRoofStyle() {
  const invalidate = useInvalidateRoofStyles();

  return useMutation({
    mutationFn: (id: string) => roofStyleService.remove(id),
    onSuccess: invalidate,
  });
}

export type { RoofStyle };
