import type { Translated } from './common';

export interface PlanLimits {
  projects: number;
  variants: number;
  versions: number;
  pdf: boolean;
  dwg: boolean | 'on_request';
  interior: boolean;
  edit: boolean;
  watermark: boolean;
}

export interface Plan {
  id: string;
  code: string;
  name: Translated;
  description?: Translated;
  priceUzs: string;
  priceUsd: string;
  limits: PlanLimits;
  sort: number;
}

export type PaymentProvider = 'PAYME' | 'CLICK' | 'STRIPE';

export interface ProviderStatus {
  code: PaymentProvider;
  ready: boolean;
  currency: 'UZS' | 'USD';
}

export interface Subscription {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  provider: PaymentProvider | null;
  periodStart: string | null;
  periodEnd: string | null;
  autoRenew: boolean;
  plan: Plan;
}

export interface Payment {
  id: string;
  provider: PaymentProvider;
  amount: string;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELED';
  paidAt: string | null;
  createdAt: string;
}

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
