'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/services';
import { queryKeys } from '@/lib/query-client';

const useAdminStats = () => {
  return useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: adminService.stats,
    staleTime: 60_000,
  });
};

export { useAdminStats };
