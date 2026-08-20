'use client';

import { Loader2, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from '@/components/ui/table';
import {
  useActivatePayoutCard,
  useCreatePayoutCard,
  useDeletePayoutCard,
  usePayoutCards,
  useUpdatePayoutCard,
  type PayoutCard,
  type PayoutCardInput,
} from '@/hooks/use-payout-cards';
import { errorFrom } from '@/lib/errors';
import type { PaymentProvider } from '@/types/domain';

/**
 * Admin obuna to'lovlari qaysi hisobga tushishini boshqaradi.
 *
 * Har o'zgarish (qo'shish, tahrir, faollashtirish, o'chirish) maxfiy kodni
 * talab qiladi — bu bazaga yoki admin hisobiga kirgan odam ham pul
 * ketadigan hisobni o'ziga yo'naltira olmasligi uchun.
 */

const PROVIDER_LABELS: Record<PaymentProvider, string> = {
  PAYME: 'Payme',
  CLICK: 'Click',
  STRIPE: 'Stripe',
};

const PROVIDERS = Object.keys(PROVIDER_LABELS) as PaymentProvider[];

const BLANK_FORM = {
  provider: 'PAYME' as PaymentProvider,
  label: '',
  last4: '',
  holder: '',
  expiry: '',
  accountId: '',
  secret: '',
};

type FormState = typeof BLANK_FORM;

/** Foydalanuvchi raqam yozgan sari `MM/YY` shakliga o'zi keladi. */
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function PayoutCards() {
  const t = useTranslations('admin.payoutCards');

  const cards = usePayoutCards();
  const create = useCreatePayoutCard();
  const update = useUpdatePayoutCard();
  const activate = useActivatePayoutCard();
  const remove = useDeletePayoutCard();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [error, setError] = useState<string | null>(null);

  const isFormOpen = editingId !== null;
  const isNew = editingId === 'new';
  const pending = create.isPending || update.isPending;

  const openCreate = () => {
    setForm(BLANK_FORM);
    setError(null);
    setEditingId('new');
  };

  const openEdit = (card: PayoutCard) => {
    setForm({
      provider: card.provider,
      label: card.label,
      last4: card.last4,
      holder: card.holder,
      expiry: card.expiry,
      accountId: card.accountId,
      secret: '',
    });
    setError(null);
    setEditingId(card.id);
  };

  const closeForm = () => {
    setEditingId(null);
    setError(null);
  };

  const submit = async () => {
    if (!form.secret) {
      setError(t('secretRequired'));
      return;
    }

    setError(null);

    const input: PayoutCardInput = {
      provider: form.provider,
      label: form.label,
      last4: form.last4,
      holder: form.holder,
      expiry: form.expiry,
      accountId: form.accountId,
    };

    try {
      if (isNew) {
        await create.mutateAsync({ ...input, secret: form.secret });
      } else if (editingId) {
        await update.mutateAsync({ id: editingId, secret: form.secret, ...input });
      }

      closeForm();
    } catch (problem) {
      setError(errorFrom(problem).message);
    }
  };

  const onActivate = async (card: PayoutCard) => {
    const secret = window.prompt(t('secretLabel'));
    if (!secret) return;
    if (!window.confirm(t('activateConfirm', { label: card.label }))) return;

    try {
      await activate.mutateAsync({ id: card.id, secret });
    } catch (problem) {
      window.alert(errorFrom(problem).message);
    }
  };

  const onDelete = async (card: PayoutCard) => {
    if (!window.confirm(t('deleteConfirm', { label: card.label }))) return;

    const secret = window.prompt(t('secretLabel'));
    if (!secret) return;

    try {
      await remove.mutateAsync({ id: card.id, secret });
    } catch (problem) {
      window.alert(errorFrom(problem).message);
    }
  };

  if (cards.isPending) {
    return <div className="h-64 animate-pulse rounded-xl border bg-muted/30" />;
  }

  const rows = cards.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">{t('subtitle')}</p>
        <Button size="sm" onClick={openCreate} disabled={isFormOpen}>
          <Plus className="size-4" />
          {t('add')}
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('provider')}</TableHead>
                <TableHead>{t('label')}</TableHead>
                <TableHead>{t('card')}</TableHead>
                <TableHead>{t('holder')}</TableHead>
                <TableHead>{t('expiry')}</TableHead>
                <TableHead>{t('active')}</TableHead>
                <TableHead className="text-end">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((card) => (
                <TableRow key={card.id}>
                  <TableCell>{PROVIDER_LABELS[card.provider]}</TableCell>
                  <TableCell>{card.label}</TableCell>
                  <TableCell className="font-mono tabular-nums">•••• {card.last4}</TableCell>
                  <TableCell>{card.holder}</TableCell>
                  <TableCell className="font-mono tabular-nums">{card.expiry}</TableCell>
                  <TableCell>
                    {card.active ? (
                      <Badge>{t('active')}</Badge>
                    ) : (
                      <Badge variant="outline">{t('inactive')}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {!card.active ? (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={t('activate')}
                          disabled={activate.isPending}
                          onClick={() => onActivate(card)}
                        >
                          <ShieldCheck className="size-4" />
                        </Button>
                      ) : null}
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={t('edit')}
                        onClick={() => openEdit(card)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      {!card.active ? (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          aria-label={t('delete')}
                          disabled={remove.isPending}
                          onClick={() => onDelete(card)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      )}

      {isFormOpen ? (
        <div className="flex flex-col gap-4 rounded-xl border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>{t('provider')}</Label>
              <Select
                value={form.provider}
                onValueChange={(value) => setForm((f) => ({ ...f, provider: value as PaymentProvider }))}
                disabled={!isNew}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {PROVIDER_LABELS[provider]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t('label')}</Label>
              <Input
                value={form.label}
                onChange={(event) => setForm((f) => ({ ...f, label: event.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t('card')}</Label>
              <Input
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
                value={form.last4}
                onChange={(event) =>
                  setForm((f) => ({ ...f, last4: event.target.value.replace(/\D/g, '').slice(0, 4) }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t('holder')}</Label>
              <Input
                value={form.holder}
                onChange={(event) => setForm((f) => ({ ...f, holder: event.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t('expiry')}</Label>
              <Input
                inputMode="numeric"
                placeholder="MM/YY"
                maxLength={5}
                value={form.expiry}
                onChange={(event) => setForm((f) => ({ ...f, expiry: formatExpiry(event.target.value) }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t('accountId')}</Label>
              <Input
                value={form.accountId}
                onChange={(event) => setForm((f) => ({ ...f, accountId: event.target.value }))}
              />
              <p className="text-xs text-muted-foreground">{t('accountIdHint')}</p>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>{t('secretLabel')}</Label>
              <Input
                type="password"
                autoComplete="off"
                value={form.secret}
                onChange={(event) => setForm((f) => ({ ...f, secret: event.target.value }))}
              />
              <p className="text-xs text-muted-foreground">{t('secretHint')}</p>
            </div>
          </div>

          {error ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={submit} disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t('save')}
            </Button>
            <Button size="sm" variant="ghost" onClick={closeForm} disabled={pending}>
              {t('cancel')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
