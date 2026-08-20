'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { auditService, planAdminService, userAdminService } from '@/lib/services';
import type { AdminUser } from '@/lib/services';

const useAuditLog = (query: { page?: number; entity?: string; action?: string } = {}) => {
  return useQuery({
    queryKey: queryKeys.audit(query),
    queryFn: () => auditService.list(query),
    staleTime: 10_000,
  });
};

const useAuditFacets = () => {
  return useQuery({
    queryKey: queryKeys.auditFacets,
    queryFn: auditService.facets,
    staleTime: 5 * 60_000,
  });
};

const useAdminPlans = () => {
  return useQuery({
    queryKey: queryKeys.adminPlans,
    queryFn: planAdminService.list,
    staleTime: 30_000,
  });
};

const useSubscriptions = (page = 1) => {
  return useQuery({
    queryKey: queryKeys.subscriptionsPage(page),
    queryFn: () => planAdminService.subscriptions(page),
    staleTime: 30_000,
  });
};

const useInvalidatePlans = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.adminPlans });
    queryClient.invalidateQueries({ queryKey: queryKeys.plans });
  };
};

const useUpdatePlan = () => {
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Record<string, unknown>) =>
      planAdminService.update(id, input),
    onSuccess: invalidate,
  });
};

const useDeactivatePlan = () => {
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: (id: string) => planAdminService.deactivate(id),
    onSuccess: invalidate,
  });
};

const useAdminUsers = (query: { page?: number; search?: string } = {}) => {
  return useQuery({
    queryKey: queryKeys.adminUsers(query),
    queryFn: () => userAdminService.list(query),
    staleTime: 30_000,
  });
};

const useSetUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: AdminUser['role'] }) =>
      userAdminService.setRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] });
    },
  });
};

const useSetUserPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, planCode, password }: { id: string; planCode: string; password: string }) =>
      userAdminService.setPlan(id, planCode, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit'] });
    },
  });
};

export {
  useAuditLog,
  useAuditFacets,
  useAdminPlans,
  useSubscriptions,
  useUpdatePlan,
  useDeactivatePlan,
  useAdminUsers,
  useSetUserRole,
  useSetUserPlan,
};
