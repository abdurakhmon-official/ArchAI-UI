'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { projectAdminService } from '@/lib/services';

export function useAdminProjects(query: { page?: number; search?: string; deleted?: string } = {}) {
  return useQuery({
    queryKey: [...queryKeys.projectsAdmin, query],
    queryFn: () => projectAdminService.list(query),
    staleTime: 15_000,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projectsAdmin });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };
}

export function useAdminDeleteProject() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => projectAdminService.remove(id),
    onSuccess: invalidate,
  });
}

export function useAdminRestoreProject() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => projectAdminService.restore(id),
    onSuccess: invalidate,
  });
}
