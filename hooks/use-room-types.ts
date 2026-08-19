'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { catalogService, roomTypeAdminService } from '@/lib/services';

export function useAllRoomTypes() {
  return useQuery({
    queryKey: queryKeys.roomTypes,
    queryFn: catalogService.roomTypes,
    staleTime: 30_000,
  });
}

export function useUpdateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      min_area?: number;
      max_area?: number;
      max_count?: number;
      default_count?: number;
      selectable?: boolean;
      sort?: number;
    }) => roomTypeAdminService.update(id, input),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roomTypes });
      queryClient.invalidateQueries({ queryKey: queryKeys.selectableRoomTypes });
    },
  });
}
