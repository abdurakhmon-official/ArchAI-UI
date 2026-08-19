'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { styleAdminService } from '@/lib/services';
import type { Translated } from '@/types/domain';

export function useAdminStyles() {
  return useQuery({
    queryKey: queryKeys.stylesAll,
    queryFn: styleAdminService.listAll,
    staleTime: 30_000,
  });
}

function useInvalidateStyles() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.stylesAll });
    queryClient.invalidateQueries({ queryKey: queryKeys.styles });
  };
}

export interface StyleDraft {
  slug?: string;
  name?: Translated;
  description?: Translated;
  roof?: Record<string, unknown>;
  roof_style_id?: string | null;
  facade?: Record<string, unknown>;
  window?: Record<string, unknown>;
  interior?: Record<string, unknown>;
  layout_rules?: Record<string, unknown>;
  preview_url?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sort?: number;
}

export function useCreateStyle() {
  const invalidate = useInvalidateStyles();

  return useMutation({
    mutationFn: (input: StyleDraft & { slug: string; name: Translated }) =>
      styleAdminService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateStyle() {
  const invalidate = useInvalidateStyles();

  return useMutation({
    mutationFn: ({ id, ...input }: StyleDraft & { id: string }) =>
      styleAdminService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteStyle() {
  const invalidate = useInvalidateStyles();

  return useMutation({
    mutationFn: (id: string) => styleAdminService.remove(id),
    onSuccess: invalidate,
  });
}
