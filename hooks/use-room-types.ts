'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { catalogService, roomTypeAdminService } from '@/lib/services';

const useAllRoomTypes = () => {
  return useQuery({
    queryKey: queryKeys.roomTypes,
    queryFn: catalogService.roomTypes,
    staleTime: 30_000,
  });
};

const useUpdateRoomType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      minArea?: number;
      maxArea?: number;
      maxCount?: number;
      defaultCount?: number;
      selectable?: boolean;
      sort?: number;
    }) => roomTypeAdminService.update(id, input),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roomTypes });
      queryClient.invalidateQueries({ queryKey: queryKeys.selectableRoomTypes });
    },
  });
};

export { useAllRoomTypes, useUpdateRoomType };
