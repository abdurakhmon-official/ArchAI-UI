'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { billingService } from '@/lib/services';
import type { PaymentProvider, PlanLimits } from '@/types/domain';

const usePlans = () => {
  return useQuery({
    queryKey: queryKeys.plans,
    queryFn: billingService.plans,
    staleTime: 30 * 60_000,
  });
};

const useProviders = () => {
  return useQuery({
    queryKey: queryKeys.providers,
    queryFn: billingService.providers,
    staleTime: 10 * 60_000,
  });
};

const useSubscription = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.subscription,
    queryFn: billingService.subscription,
    enabled,
  });
};

const usePlanLimits = (): PlanLimits | null => {
  const plans = usePlans();
  const subscription = useSubscription();

  const active = subscription.data?.subscription;
  if (active) return active.plan.limits;

  if (subscription.isPending || plans.isPending) return null;

  return plans.data?.find((plan) => plan.code === 'free')?.limits ?? null;
};

const useCheckout = () => {
  return useMutation({
    mutationFn: ({
      planCode,
      provider,
      months,
    }: {
      planCode: string;
      provider: PaymentProvider;
      months?: number;
    }) => billingService.checkout(planCode, provider, months ?? 1),

    onSuccess: (result) => {
      window.location.href = result.redirectUrl;
    },
  });
};

const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) => billingService.cancel(subscriptionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.subscription }),
  });
};

export { usePlans, useProviders, useSubscription, usePlanLimits, useCheckout, useCancelSubscription };
