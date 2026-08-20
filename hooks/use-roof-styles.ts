'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { roofStyleService } from '@/lib/services';
import type { RoofStyle, Translated } from '@/types/domain';

const useRoofStyles = () => {
  return useQuery({
    queryKey: queryKeys.roofStyles,
    queryFn: roofStyleService.listAll,
    staleTime: 30_000,
  });
};

const useRoofFamilies = () => {
  return useQuery({
    queryKey: queryKeys.roofFamilies,
    queryFn: roofStyleService.families,
    staleTime: 60 * 60_000,
  });
};

const useInvalidateRoofStyles = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.roofStyles });
    queryClient.invalidateQueries({ queryKey: queryKeys.styles });
  };
};

export interface RoofStyleDraft {
  code?: string;
  name?: Translated;
  family?: string;
  pitch?: number;
  overhang?: number;
  upperPitch?: number | null;
  breakRatio?: number | null;
  coveringId?: string | null;
  color?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sort?: number;
}

const useCreateRoofStyle = () => {
  const invalidate = useInvalidateRoofStyles();

  return useMutation({
    mutationFn: (input: RoofStyleDraft & { code: string; name: Translated; family: string }) =>
      roofStyleService.create(input),
    onSuccess: invalidate,
  });
};

const useUpdateRoofStyle = () => {
  const invalidate = useInvalidateRoofStyles();

  return useMutation({
    mutationFn: ({ id, ...input }: RoofStyleDraft & { id: string }) =>
      roofStyleService.update(id, input),
    onSuccess: invalidate,
  });
};

const useDeleteRoofStyle = () => {
  const invalidate = useInvalidateRoofStyles();

  return useMutation({
    mutationFn: (id: string) => roofStyleService.remove(id),
    onSuccess: invalidate,
  });
};

export { useRoofStyles, useRoofFamilies, useCreateRoofStyle, useUpdateRoofStyle, useDeleteRoofStyle };
export type { RoofStyle };
