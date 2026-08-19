'use client';

import { Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { useCancelSubscription, useSubscription } from '@/hooks/use-billing';
import { formatDate, formatDecimal, translated } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/**
 * Obuna holati va to'lovlar tarixi.
 *
 * Obuna yo'q bo'lsa ham bo'sh ekran ko'rsatilmaydi — bepul tarifda
 * ekanligi aytiladi va tariflarga yo'l ko'rsatiladi.
 */

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-primary/10 text-primary',
  PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  PAST_DUE: 'bg-destructive/10 text-destructive',
  CANCELED: 'bg-muted text-muted-foreground',
  EXPIRED: 'bg-muted text-muted-foreground',
};

export function SubscriptionPanel() {
  const t = useTranslations('subscription');
  const locale = useLocale();

  const data = useSubscription();
  const cancel = useCancelSubscription();

  if (data.isPending) {
    return <div className="h-48 animate-pulse rounded-xl border bg-muted/30" />;
  }

  const subscription = data.data?.subscription ?? null;
  const payments = data.data?.payments ?? [];

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-xl border bg-card p-6">
        {subscription ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  {translated(subscription.plan.name, locale)}
                </h2>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    STATUS_STYLES[subscription.status] ?? STATUS_STYLES.CANCELED,
                  )}
                >
                  {t(`status.${subscription.status}`)}
                </span>
              </div>

              {subscription.period_end ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {subscription.auto_renew
                    ? t('renewsOn', { date: formatDate(subscription.period_end, locale) })
                    : t('endsOn', { date: formatDate(subscription.period_end, locale) })}
                </p>
              ) : null}
            </div>

            <div className="flex gap-2">
              <ButtonLink variant="outline" size="sm" href="/narxlash">
                {t('changePlan')}
              </ButtonLink>

              {subscription.status === 'ACTIVE' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  disabled={cancel.isPending}
                  onClick={() => {
                    // Tasdiq so'raladi: bekor qilishni orqaga qaytarib
                    // bo'lmaydi, qaytadan to'lash kerak bo'ladi.
                    if (window.confirm(t('cancelConfirm'))) cancel.mutate(subscription.id);
                  }}
                >
                  {cancel.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  {t('cancel')}
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{t('freePlan')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('freeHint')}</p>
            </div>

            <ButtonLink size="sm" href="/narxlash">
              {t('upgrade')}
            </ButtonLink>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">{t('payments')}</h3>

        {payments.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            {t('noPayments')}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-md text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-start font-medium">{t('date')}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('provider')}</th>
                  <th className="px-3 py-2 text-start font-medium">{t('paymentStatus')}</th>
                  <th className="px-3 py-2 text-end font-medium">{t('amount')}</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      {formatDate(payment.paid_at ?? payment.created_at, locale)}
                    </td>
                    <td className="px-3 py-2">{payment.provider}</td>
                    <td className="px-3 py-2">{t(`paymentStatuses.${payment.status}`)}</td>
                    <td className="px-3 py-2 text-end font-mono tabular-nums">
                      {formatDecimal(payment.amount, { locale })} {payment.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
