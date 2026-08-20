'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { queryKeys } from '@/lib/query-client';
import { unwrap } from '@/lib/services/unwrap';
import type { PaymentProvider } from '@/types/domain';

export interface PayoutCard {
  id: string;
  provider: PaymentProvider;
  label: string;
  last4: string;
  holder: string;
  expiry: string;
  accountId: string;
  active: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutCardInput {
  provider: PaymentProvider;
  label: string;
  last4: string;
  holder: string;
  expiry: string;
  accountId: string;
}

const secretHeaders = (secret: string) => ({ headers: { 'X-Billing-Secret': secret } });

const usePayoutCards = () => {
  return useQuery({
    queryKey: queryKeys.adminPayoutCards,
    queryFn: () => unwrap<PayoutCard[]>(api.get('/payout-cards')),
  });
};

function useInvalidatePayoutCards() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: queryKeys.adminPayoutCards });
}

const useCreatePayoutCard = () => {
  const invalidate = useInvalidatePayoutCards();

  return useMutation({
    mutationFn: ({ secret, ...input }: PayoutCardInput & { secret: string }) =>
      unwrap<PayoutCard>(api.post('/payout-cards', input, secretHeaders(secret))),
    onSuccess: invalidate,
  });
};

const useUpdatePayoutCard = () => {
  const invalidate = useInvalidatePayoutCards();

  return useMutation({
    mutationFn: ({
      id,
      secret,
      ...input
    }: Partial<PayoutCardInput> & { id: string; secret: string }) =>
      unwrap<PayoutCard>(api.put(`/payout-cards/${id}`, input, secretHeaders(secret))),
    onSuccess: invalidate,
  });
};

const useActivatePayoutCard = () => {
  const invalidate = useInvalidatePayoutCards();

  return useMutation({
    mutationFn: ({ id, secret }: { id: string; secret: string }) =>
      unwrap<PayoutCard>(api.post(`/payout-cards/${id}/activate`, undefined, secretHeaders(secret))),
    onSuccess: invalidate,
  });
};

const useDeletePayoutCard = () => {
  const invalidate = useInvalidatePayoutCards();

  return useMutation({
    mutationFn: ({ id, secret }: { id: string; secret: string }) =>
      api.delete(`/payout-cards/${id}`, secretHeaders(secret)),
    onSuccess: invalidate,
  });
};

export {
  usePayoutCards,
  useCreatePayoutCard,
  useUpdatePayoutCard,
  useActivatePayoutCard,
  useDeletePayoutCard,
};
