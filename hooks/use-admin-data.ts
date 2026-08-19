'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { auditService, planAdminService, userAdminService } from '@/lib/services';
import type { AdminUser } from '@/lib/services';

export function useAuditLog(query: { page?: number; entity?: string; action?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.audit(query),
    queryFn: () => auditService.list(query),
    staleTime: 10_000,
  });
}

export function useAuditFacets() {
  return useQuery({
    queryKey: queryKeys.auditFacets,
    queryFn: auditService.facets,
    staleTime: 5 * 60_000,
  });
}

export function useAdminPlans() {
  return useQuery({
    queryKey: queryKeys.adminPlans,
    queryFn: planAdminService.list,
    staleTime: 30_000,
  });
}

export function useSubscriptions(page = 1) {
  return useQuery({
    queryKey: queryKeys.subscriptionsPage(page),
    queryFn: () => planAdminService.subscriptions(page),
    staleTime: 30_000,
  });
}

function useInvalidatePlans() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.adminPlans });
    queryClient.invalidateQueries({ queryKey: queryKeys.plans });
  };
}

export function useUpdatePlan() {
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Record<string, unknown>) =>
      planAdminService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeactivatePlan() {
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: (id: string) => planAdminService.deactivate(id),
    onSuccess: invalidate,
  });
}

export function useAdminUsers(query: { page?: number; search?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.adminUsers(query),
    queryFn: () => userAdminService.list(query),
    staleTime: 30_000,
  });
}

export function useSetUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: AdminUser['role'] }) =>
      userAdminService.setRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] });
    },
  });
}
