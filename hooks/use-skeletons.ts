'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { skeletonAdminService } from '@/lib/services';
import type { SkeletonInput } from '@/types/domain';

export function useSkeletons() {
  return useQuery({
    queryKey: queryKeys.adminSkeletons,
    queryFn: skeletonAdminService.list,
    staleTime: 30_000,
  });
}

function useInvalidateSkeletons() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.adminSkeletons });
    queryClient.invalidateQueries({ queryKey: queryKeys.skeletons });
  };
}

export function useCreateSkeleton() {
  const invalidate = useInvalidateSkeletons();

  return useMutation({
    mutationFn: (input: SkeletonInput) => skeletonAdminService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateSkeleton() {
  const invalidate = useInvalidateSkeletons();

  return useMutation({
    mutationFn: ({ id, ...input }: SkeletonInput & { id: string }) =>
      skeletonAdminService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDuplicateSkeleton() {
  const invalidate = useInvalidateSkeletons();

  return useMutation({
    mutationFn: (id: string) => skeletonAdminService.duplicate(id),
    onSuccess: invalidate,
  });
}

export function useDeleteSkeleton() {
  const invalidate = useInvalidateSkeletons();

  return useMutation({
    mutationFn: (id: string) => skeletonAdminService.remove(id),
    onSuccess: invalidate,
  });
}
