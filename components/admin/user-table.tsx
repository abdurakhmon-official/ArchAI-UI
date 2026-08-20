'use client';

import { Loader2, Search, ShieldCheck } from 'lucide-react';
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
import { useAdminPlans, useAdminUsers, useSetUserPlan, useSetUserRole } from '@/hooks/use-admin-data';
import { useSession } from '@/hooks/use-auth';
import { errorFrom } from '@/lib/errors';
import { formatDate, translated } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/lib/services';

/**
 * Foydalanuvchilar.
 *
 * API allaqachon tayyor edi (`GET /users/paginated`), lekin uni
 * chaqiradigan ekran yo'q edi — ya'ni admin ro'yxatni umuman ko'ra
 * olmasdi.
 *
 * Ikkita yozish amali bor. Rol o'zgartirish — ADMIN darajasi hamma
 * cheklovni chetlab o'tadi, shuning uchun tasdiqlash bilan qo'yilgan.
 * Tarif o'zgartirish — pul bilan bog'liq imtiyoz, shuning uchun rol
 * kabi bir bosishda emas: admin o'z parolini qayta kiritishi shart va
 * amal `O'zgarishlar jurnali`ga tushadi.
 */

const ROLES: AdminUser['role'][] = ['USER', 'ARCHITECT', 'ADMIN'];

const PAGE_SIZE = 20;

export function UserTable() {
  const t = useTranslations('admin.users');
  const locale = useLocale();
  const session = useSession();

  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState<{ id: string; role: AdminUser['role'] } | null>(null);
  const [confirmingPlan, setConfirmingPlan] = useState<{ id: string; planCode: string } | null>(null);
  const [planPassword, setPlanPassword] = useState('');
  const [failure, setFailure] = useState<string | null>(null);

  const users = useAdminUsers({ page, ...(query ? { search: query } : {}) });
  const plans = useAdminPlans();
  const setRole = useSetUserRole();
  const setPlan = useSetUserPlan();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const apply = async (id: string, role: AdminUser['role']) => {
    setFailure(null);

    try {
      await setRole.mutateAsync({ id, role });
      setConfirming(null);
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  const applyPlan = async (id: string, planCode: string, password: string) => {
    setFailure(null);

    try {
      await setPlan.mutateAsync({ id, planCode, password });
      setConfirmingPlan(null);
      setPlanPassword('');
    } catch (error) {
      setFailure(errorFrom(error).message);
      setPlanPassword('');
    }
  };

  if (users.isError) {
    return (
      <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        {errorFrom(users.error).message}
      </p>
    );
  }

  const rows = users.data?.items ?? [];
  const total = users.data?.total ?? 0;
  const pages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="flex max-w-md gap-2">
        <Input
          value={search}
          placeholder={t('searchPlaceholder')}
          aria-label={t('search')}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Button type="submit" variant="outline" size="sm">
          <Search className="size-4" />
          {t('search')}
        </Button>
      </form>

      {failure ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {failure}
        </p>
      ) : null}

      {users.isPending ? (
        <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <>
          <TableWrap>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t('name')}</TableHead>
                  <TableHead className="text-start">{t('email')}</TableHead>
                  <TableHead className="text-start">{t('joined')}</TableHead>
                  <TableHead className="text-start">{t('role')}</TableHead>
                  <TableHead className="text-start">{t('plan')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((user) => {
                  const isSelf = user.id === session.user?.id;
                  const pending = confirming?.id === user.id;
                  const pendingPlan = confirmingPlan?.id === user.id;
                  const currentPlanCode = user.currentPlan?.code ?? 'free';

                  return (
                    <TableRow key={user.id} className={cn(!user.active && 'opacity-50')}>
                      <TableCell>
                        <span className="font-medium">{user.fullName}</span>
                        {isSelf ? (
                          <span className="ms-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                            {t('you')}
                          </span>
                        ) : null}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {user.email}
                        {!user.emailVerified ? (
                          <span className="ms-2 text-xs text-destructive">{t('unverified')}</span>
                        ) : null}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(user.createdAt, locale)}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {ROLES.map((role) => (
                            <button
                              key={role}
                              type="button"
                              aria-pressed={user.role === role}
                              /*
                                O'z rolini pasaytirish — panelga kirishni
                                yo'qotish demak, va uni qaytarishning
                                yagona yo'li bazaga qo'l bilan kirish
                                bo'lardi. Shuning uchun to'sib qo'yilgan.
                              */
                              disabled={isSelf || setRole.isPending}
                              onClick={() =>
                                user.role === role
                                  ? undefined
                                  : role === 'ADMIN'
                                    ? setConfirming({ id: user.id, role })
                                    : apply(user.id, role)
                              }
                              className={cn(
                                'rounded-lg border px-2 py-1 text-xs transition-colors',
                                user.role === role
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'hover:border-foreground/30 hover:bg-muted',
                                isSelf && 'cursor-not-allowed',
                              )}
                            >
                              {t(`roles.${role}` as never)}
                            </button>
                          ))}
                        </div>

                        {/*
                          ADMIN roli alohida tasdiqlanadi: u tarif
                          cheklovlarini ham, egalik tekshiruvini ham
                          chetlab o'tadi.
                        */}
                        {pending ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-2.5 py-2">
                            <ShieldCheck className="size-3.5 shrink-0 text-destructive" aria-hidden />
                            <span className="text-xs text-destructive">{t('adminWarning')}</span>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="ms-auto"
                              onClick={() => setConfirming(null)}
                            >
                              {t('cancel')}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => apply(user.id, confirming!.role)}
                              disabled={setRole.isPending}
                            >
                              {setRole.isPending ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : null}
                              {t('confirm')}
                            </Button>
                          </div>
                        ) : null}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(plans.data ?? [])
                            .filter((plan) => plan.active)
                            .map((plan) => (
                              <button
                                key={plan.code}
                                type="button"
                                aria-pressed={currentPlanCode === plan.code}
                                disabled={setPlan.isPending}
                                onClick={() =>
                                  currentPlanCode === plan.code
                                    ? undefined
                                    : (setConfirmingPlan({ id: user.id, planCode: plan.code }),
                                      setPlanPassword(''))
                                }
                                className={cn(
                                  'rounded-lg border px-2 py-1 text-xs transition-colors',
                                  currentPlanCode === plan.code
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'hover:border-foreground/30 hover:bg-muted',
                                )}
                              >
                                {translated(plan.name, locale) || plan.code}
                              </button>
                            ))}
                        </div>

                        {/*
                          Tarif — pul bilan bog'liq imtiyoz, shuning
                          uchun rol kabi bir bosishda emas: admin o'z
                          parolini qayta kiritishi shart.
                        */}
                        {pendingPlan ? (
                          <div className="mt-2 flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-2.5 py-2">
                            <span className="text-xs text-destructive">{t('planWarning')}</span>

                            <Input
                              type="password"
                              autoComplete="current-password"
                              value={planPassword}
                              placeholder={t('passwordPlaceholder')}
                              aria-label={t('passwordLabel')}
                              onChange={(event) => setPlanPassword(event.target.value)}
                              className="h-8 text-xs"
                            />

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setConfirmingPlan(null);
                                  setPlanPassword('');
                                }}
                              >
                                {t('cancel')}
                              </Button>
                              <Button
                                size="sm"
                                className="ms-auto"
                                disabled={setPlan.isPending || !planPassword}
                                onClick={() =>
                                  applyPlan(user.id, confirmingPlan!.planCode, planPassword)
                                }
                              >
                                {setPlan.isPending ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : null}
                                {t('confirm')}
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableWrap>

          {pages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {t('pageOf', { page, pages, total })}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  {t('prev')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  {t('next')}
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
