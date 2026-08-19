import api from '@/lib/axios';
import { unwrap } from '@/lib/services/unwrap';
import type { Payment, PaymentProvider, Plan, ProviderStatus, Subscription, Translated } from '@/types/domain';

// --- Tarif va to'lov -------------------------------------------------------

export const billingService = {
  plans() {
    return unwrap<Plan[]>(api.get('/billing/plans'));
  },

  providers() {
    return unwrap<ProviderStatus[]>(api.get('/billing/providers'));
  },

  subscription() {
    return unwrap<{ subscription: Subscription | null; payments: Payment[] }>(
      api.get('/billing/subscription'),
    );
  },

  checkout(planCode: string, provider: PaymentProvider, months = 1) {
    return unwrap<{
      provider: PaymentProvider;
      subscriptionId: string;
      amount: number;
      currency: string;
      redirectUrl: string;
    }>(api.post('/billing/checkout', { planCode, provider, months }));
  },

  cancel(subscriptionId: string) {
    return api.delete(`/billing/subscription/${subscriptionId}`);
  },
};

// --- Admin: tariflar ---------------------------------------------------------------

export interface AdminPlan extends Plan {
  active: boolean;
  _count?: { subscriptions: number };
}

export interface AdminSubscription {
  id: string;
  status: string;
  provider: PaymentProvider | null;
  period_start: string | null;
  period_end: string | null;
  auto_renew: boolean;
  created_at: string;
  plan: { code: string; name: Translated };
  user: { id: string; fullName: string; email: string } | null;
  payments: { status: string; amount: string; currency: string; paid_at: string | null }[];
}

export const planAdminService = {
  list() {
    return unwrap<AdminPlan[]>(api.get('/plans'));
  },

  async subscriptions(page = 1) {
    const { data } = await api.get<{
      data: AdminSubscription[];
      meta: { page: number; limit: number; total: number; pages: number };
    }>('/plans/subscriptions', { params: { page } });

    return data;
  },

  update(id: string, input: object) {
    return unwrap<AdminPlan>(api.put(`/plans/${id}`, input));
  },

  deactivate(id: string) {
    return unwrap<AdminPlan>(api.delete(`/plans/${id}`));
  },
};
