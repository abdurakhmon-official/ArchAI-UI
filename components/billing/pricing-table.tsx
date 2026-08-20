'use client';

import { Check, Loader2, Minus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { useSession } from '@/hooks/use-auth';
import { useCheckout, usePlans, useProviders, useSubscription } from '@/hooks/use-billing';
import { errorFrom } from '@/lib/errors';
import { formatDecimal, translated } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Plan, PaymentProvider, PlanLimits } from '@/types/domain';

const PROVIDER_LABELS: Record<PaymentProvider, string> = {
  PAYME: 'Payme',
  CLICK: 'Click',
  STRIPE: 'Stripe',
};

const FEATURES: (keyof PlanLimits)[] = [
  'projects',
  'variants',
  'edit',
  'pdf',
  'versions',
  'interior',
  'dwg',
  'watermark',
];

export function PricingTable() {
  const t = useTranslations('pricing');
  const locale = useLocale();

  const { isAuthenticated } = useSession();
  const plans = usePlans();
  const providers = useProviders();
  const subscription = useSubscription(isAuthenticated);
  const checkout = useCheckout();

  const [chosen, setChosen] = useState<string | null>(null);

  const ready = (providers.data ?? []).filter((provider) => provider.ready);

  const active = subscription.data?.subscription;
  const freeCode = (plans.data ?? []).find((plan) => Number(plan.priceUzs) === 0)?.code;
  const currentCode =
    active && active.status === 'ACTIVE' ? active.plan.code : isAuthenticated ? freeCode : undefined;

  if (plans.isPending) {
    return (
      <div className="grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-96 animate-pulse rounded-xl border bg-muted/30" />
        ))}
      </div>
    );
  }

  const detail = checkout.error ? errorFrom(checkout.error) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 md:grid-cols-3">
        {(plans.data ?? []).map((plan) => {
          const isCurrent = plan.code === currentCode;
          const isFree = Number(plan.priceUzs) === 0;

          return (
            <div
              key={plan.id}
              className={cn(
                'flex flex-col gap-5 rounded-xl border bg-card p-6',
                isCurrent && 'ring-2 ring-primary',
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">{translated(plan.name, locale)}</h2>
                  {isCurrent ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {t('current')}
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
                  {isFree ? t('free') : formatDecimal(plan.priceUzs, { locale })}
                  {!isFree ? (
                    <span className="ms-1 text-sm font-normal text-muted-foreground">
                      {t('perMonth')}
                    </span>
                  ) : null}
                </p>

                {plan.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {translated(plan.description, locale)}
                  </p>
                ) : null}
              </div>

              <ul className="flex flex-1 flex-col gap-2 text-sm">
                {FEATURES.map((feature) => (
                  <FeatureRow
                    key={feature}
                    label={t(`features.${feature}`)}
                    value={plan.limits[feature]}
                    inverted={feature === 'watermark'}
                    unlimited={t('unlimited')}
                    onRequest={t('onRequest')}
                  />
                ))}
              </ul>

              <PlanAction
                plan={plan}
                isCurrent={isCurrent}
                isFree={isFree}
                isAuthenticated={isAuthenticated}
                providers={ready}
                chosen={chosen === plan.code}
                pending={checkout.isPending}
                onChoose={() => setChosen(chosen === plan.code ? null : plan.code)}
                onPay={(provider) => checkout.mutate({ planCode: plan.code, provider })}
              />
            </div>
          );
        })}
      </div>

      {ready.length === 0 && !providers.isPending ? (
        <p className="rounded-lg border border-dashed px-4 py-3 text-center text-sm text-muted-foreground">
          {t('noProviders')}
        </p>
      ) : null}

      {detail ? <p className="text-center text-sm text-destructive">{detail.message}</p> : null}
    </div>
  );
}

function FeatureRow({
  label,
  value,
  inverted,
  unlimited,
  onRequest,
}: {
  label: string;
  value: PlanLimits[keyof PlanLimits];
  inverted?: boolean;
  unlimited: string;
  onRequest: string;
}) {
  const included = inverted ? value !== true : value !== false && value !== 0;

  const text =
    typeof value === 'number'
      ? value < 0
        ? unlimited
        : String(value)
      : value === 'on_request'
        ? onRequest
        : null;

  return (
    <li className={cn('flex items-center gap-2', !included && 'text-muted-foreground')}>
      {included ? (
        <Check className="size-4 shrink-0 text-primary" />
      ) : (
        <Minus className="size-4 shrink-0" />
      )}
      <span className="flex-1">{label}</span>
      {text ? <span className="font-mono text-xs tabular-nums">{text}</span> : null}
    </li>
  );
}

interface ActionProps {
  plan: Plan;
  isCurrent: boolean;
  isFree: boolean;
  isAuthenticated: boolean;
  providers: { code: PaymentProvider }[];
  chosen: boolean;
  pending: boolean;
  onChoose: () => void;
  onPay: (provider: PaymentProvider) => void;
}

function PlanAction({
  isCurrent,
  isFree,
  isAuthenticated,
  providers,
  chosen,
  pending,
  onChoose,
  onPay,
}: ActionProps) {
  const t = useTranslations('pricing');

  if (isCurrent) {
    return (
      <Button disabled variant="outline">
        {t('current')}
      </Button>
    );
  }

  // Bepul tarifni "sotib olib" bo'lmaydi — u sukut bo'yicha beriladi.
  if (isFree) {
    return (
      <Button disabled variant="outline">
        {t('freeIncluded')}
      </Button>
    );
  }

  if (!isAuthenticated) {
    return <ButtonLink href="/sign-in">{t('signInToBuy')}</ButtonLink>;
  }

  if (!providers.length) {
    return (
      <Button disabled variant="outline">
        {t('unavailable')}
      </Button>
    );
  }

  if (!chosen) {
    return <Button onClick={onChoose}>{t('choose')}</Button>;
  }

  // To'lov usulini tanlash — provayderlar soni kam, ochiq tugmalar tez.
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">{t('choosePayment')}</p>
      <div className="flex flex-wrap gap-2">
        {providers.map((provider) => (
          <Button
            key={provider.code}
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => onPay(provider.code)}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {PROVIDER_LABELS[provider.code]}
          </Button>
        ))}
      </div>
    </div>
  );
}
