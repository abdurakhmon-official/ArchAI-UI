'use client';

import { useQuery } from '@tanstack/react-query';
import { toGenerateParams, type ConstructorParams } from '@/lib/constructor';
import { queryKeys } from '@/lib/query-client';
import { generationService } from '@/lib/services';

const useGenerate = (params: ConstructorParams | null) => {
  return useQuery({
    queryKey: queryKeys.generate(params ? { ...toGenerateParams(params) } : {}),
    queryFn: () => generationService.generate(toGenerateParams(params!)),
    enabled: params !== null,
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    retry: false,
  });
};

export { useGenerate };
