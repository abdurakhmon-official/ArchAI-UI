'use client';

import { Loader2, RotateCcw, Save } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrap,
} from '@/components/ui/table';
import { useAdminPlans, useDeactivatePlan, useSubscriptions, useUpdatePlan } from '@/hooks/use-admin-data';
import { errorFrom } from '@/lib/errors';
import { formatDate, formatDecimal, toNumber, translated } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { AdminPlan } from '@/lib/services';
import type { PlanLimits } from '@/types/domain';

/**
 * Tariflar va obunalar.
 *
 * Bu ekrangacha tariflarni faqat urug' orqali o'zgartirish mumkin edi —
 * ya'ni narxni ko'tarish uchun kod tahriri va qayta joylashtirish kerak
 * bo'lardi.
 *
 * DIQQAT: bu yerdagi chegaralar MAVJUD obunachilarga ham darhol
 * tegishli. `effectiveFor` ularni har so'rovda tarifdan o'qiydi va
 * obunada nusxa saqlanmaydi.
 */

/** Raqamli chegaralar — mantiqiylari alohida ko'rsatiladi. */
const NUMERIC: (keyof PlanLimits)[] = ['projects', 'variants', 'versions'];
const FLAGS: (keyof PlanLimits)[] = ['pdf', 'interior', 'edit', 'watermark'];

type Draft = Record<string, { price_uzs?: number; limits?: PlanLimits }>;

export function PlanTable() {
  const t = useTranslations('admin.plans');
  const locale = useLocale();

  const plans = useAdminPlans();
  const subscriptions = useSubscriptions(1);
  const update = useUpdatePlan();
  const deactivate = useDeactivatePlan();

  const [draft, setDraft] = useState<Draft>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty = Object.keys(draft).length > 0;

  const change = (id: string, patch: Draft[string]) => {
    setFailure(null);
    setDraft((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  };

  /** Ketma-ket saqlaymiz — har o'zgarish jurnalga alohida tushadi. */
  const save = async () => {
    setSaving(true);
    setFailure(null);

    try {
      for (const [id, patch] of Object.entries(draft)) {
        await update.mutateAsync({ id, ...patch });
      }
      setDraft({});
    } catch (error) {
      setFailure(errorFrom(error).message);
    } finally {
      setSaving(false);
    }
  };

  if (plans.isPending) {
    return <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />;
  }

  if (plans.isError) {
    return (
      <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        {errorFrom(plans.error).message}
      </p>
    );
  }

  const rows = plans.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      {failure ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {failure}
        </p>
      ) : null}

      <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
        {t('liveWarning')}
      </p>

      <TableWrap>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">{t('plan')}</TableHead>
              <TableHead className="text-end">{t('price')}</TableHead>
              {NUMERIC.map((key) => (
                <TableHead key={key} className="text-end">
                  {t(`limits.${key}` as never)}
                </TableHead>
              ))}
              <TableHead className="text-start">{t('features')}</TableHead>
              <TableHead className="text-end">{t('subscribers')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((plan) => {
              const patch = draft[plan.id] ?? {};
              const limits = patch.limits ?? (plan.limits as PlanLimits);
              const price = patch.price_uzs ?? toNumber(plan.price_uzs);

              return (
                <TableRow key={plan.id} className={cn(!plan.active && 'opacity-50')}>
                  <TableCell>
                    <span className="font-medium">{translated(plan.name, locale) || plan.code}</span>
                    <span className="ms-2 font-mono text-xs text-muted-foreground">{plan.code}</span>
                    {!plan.active ? (
                      <span className="ms-2 text-xs text-destructive">{t('inactive')}</span>
                    ) : null}
                  </TableCell>

                  <TableCell className="text-end">
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      aria-label={`${plan.code} — ${t('price')}`}
                      className="w-32 text-end font-mono tabular-nums"
                      value={price}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        if (Number.isFinite(value) && value >= 0) {
                          change(plan.id, { price_uzs: value });
                        }
                      }}
                    />
                  </TableCell>

                  {NUMERIC.map((key) => (
                    <TableCell key={key} className="text-end">
                      <Input
                        type="number"
                        min={-1}
                        aria-label={`${plan.code} — ${t(`limits.${key}` as never)}`}
                        className="w-20 text-end font-mono tabular-nums"
                        value={limits[key] as number}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          if (Number.isInteger(value)) {
                            change(plan.id, { limits: { ...limits, [key]: value } });
                          }
                        }}
                      />
                    </TableCell>
                  ))}

                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {FLAGS.map((key) => (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={Boolean(limits[key])}
                          onClick={() =>
                            change(plan.id, { limits: { ...limits, [key]: !limits[key] } })
                          }
                          className={cn(
                            'rounded-lg border px-2 py-1 text-xs transition-colors',
                            limits[key]
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:border-foreground/30 hover:bg-muted',
                          )}
                        >
                          {t(`limits.${key}` as never)}
                        </button>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell className="text-end font-mono tabular-nums">
                    {plan._count?.subscriptions ?? 0}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableWrap>

      <p className="text-xs text-muted-foreground">{t('unlimitedHint')}</p>

      {dirty ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {t('save')}
          </Button>

          <Button variant="ghost" size="sm" onClick={() => setDraft({})} disabled={saving}>
            <RotateCcw className="size-4" />
            {t('reset')}
          </Button>
        </div>
      ) : null}

      {/* --- Obunalar --------------------------------------------------- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">{t('subscriptions')}</h2>

        {subscriptions.isPending ? (
          <div className="h-40 animate-pulse rounded-xl border bg-muted/30" />
        ) : (subscriptions.data?.data.length ?? 0) === 0 ? (
          <p className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            {t('noSubscriptions')}
          </p>
        ) : (
          <TableWrap>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t('subscriber')}</TableHead>
                  <TableHead className="text-start">{t('plan')}</TableHead>
                  <TableHead className="text-start">{t('status')}</TableHead>
                  <TableHead className="text-start">{t('until')}</TableHead>
                  <TableHead className="text-end">{t('lastPayment')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {subscriptions.data!.data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {row.user ? (
                        <span title={row.user.email}>{row.user.fullName}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{translated(row.plan.name, locale) || row.plan.code}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-xs',
                          row.status === 'ACTIVE'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {row.period_end ? formatDate(row.period_end, locale) : '—'}
                    </TableCell>
                    <TableCell className="text-end font-mono tabular-nums">
                      {row.payments[0]
                        ? `${formatDecimal(toNumber(row.payments[0].amount), { locale })} ${row.payments[0].currency}`
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrap>
        )}
      </section>

      {/*
        Yoqish va o'chirish alohida turadi — ular kamdan kam kerak.

        Qaytarish tugmasi ilgari yo'q edi: nofaollashtirilgan tarifni
        faqat baza orqali tiklash mumkin edi, chunki `active` uchda
        bor bo'lsa ham unga hech qanday tugma ulanmagandi.
      */}
      <div className="flex flex-wrap gap-2 border-t pt-4">
        {rows
          .filter((plan) => plan.code !== 'free')
          .map((plan: AdminPlan) =>
            plan.active ? (
              <Button
                key={plan.id}
                variant="ghost"
                size="sm"
                className="text-destructive"
                disabled={deactivate.isPending}
                onClick={() => deactivate.mutate(plan.id)}
              >
                {t('deactivate', { plan: translated(plan.name, locale) || plan.code })}
              </Button>
            ) : (
              <Button
                key={plan.id}
                variant="outline"
                size="sm"
                disabled={update.isPending}
                onClick={() => update.mutate({ id: plan.id, active: true })}
              >
                {t('activate', { plan: translated(plan.name, locale) || plan.code })}
              </Button>
            ),
          )}
      </div>
    </div>
  );
}
