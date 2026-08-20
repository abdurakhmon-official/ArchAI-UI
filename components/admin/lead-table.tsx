'use client';

import { Loader2, Save, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDeleteLead, useLeads, useUpdateLead } from '@/hooks/use-content-admin';
import { errorFrom } from '@/lib/errors';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/types/domain';

/**
 * Murojaatlar.
 *
 * `POST /leads` ochiq — saytdagi bog'lanish formasi shu yerga yozadi.
 * Ro'yxat esa admin uchun edi va uni ko'radigan ekran yo'q edi: yangi
 * murojaat kelgani faqat boshqaruv panelidagi sondan bilinardi.
 *
 * Jadval emas, kartochkalar: murojaatda uzun matn bor (mijozning
 * xabari va admin izohi) va u jadval katakchasiga sig'maydi. Mobil
 * ekranda ham kartochka o'zi tabiiy joylashadi.
 *
 * Mijoz yozgan `message` faqat KO'RSATILADI. Admin qaydi alohida
 * maydonda — asl murojaatni tahrirlash uning mazmunini yo'qotardi.
 */

const STATUSES: LeadStatus[] = ['NEW', 'IN_PROGRESS', 'CONTACTED', 'CLOSED', 'SPAM'];

/** Holat rangi — yangi murojaat ko'zga tashlanishi kerak. */
const TONE: Record<LeadStatus, string> = {
  NEW: 'border-primary/40 bg-primary/5 text-primary',
  IN_PROGRESS: 'border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400',
  CONTACTED: 'border-sky-500/40 bg-sky-500/5 text-sky-700 dark:text-sky-400',
  CLOSED: 'border-transparent bg-muted text-muted-foreground',
  SPAM: 'border-destructive/40 bg-destructive/5 text-destructive',
};

export function LeadTable() {
  const t = useTranslations('admin.leads');

  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const leads = useLeads({ page, ...(status ? { status } : {}) });

  const rows = leads.data?.data ?? [];
  const meta = leads.data?.meta as { page: number; pages: number; open?: number } | undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip active={status === ''} onClick={() => { setStatus(''); setPage(1); }}>
          {t('all')}
        </Chip>
        {STATUSES.map((code) => (
          <Chip
            key={code}
            active={status === code}
            onClick={() => { setStatus(code); setPage(1); }}
          >
            {t(`statuses.${code}` as never)}
          </Chip>
        ))}

        {meta?.open ? (
          <span className="ms-auto text-sm text-muted-foreground">
            {t('openCount', { count: meta.open })}
          </span>
        ) : null}
      </div>

      {leads.isPending ? (
        <div className="h-64 animate-pulse rounded-xl border bg-muted/30" />
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </ul>
      )}

      {meta && meta.pages > 1 ? (
        <div className="flex items-center justify-between gap-2 text-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            {t('prev')}
          </Button>
          <span className="tabular-nums text-muted-foreground">
            {meta.page} / {meta.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.pages}
            onClick={() => setPage((value) => value + 1)}
          >
            {t('next')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------

function LeadCard({ lead }: { lead: Lead }) {
  const t = useTranslations('admin.leads');
  const locale = useLocale();

  const update = useUpdateLead();
  const remove = useDeleteLead();

  const [note, setNote] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  // `null` — tegilmagan; shundagina "saqlash" tugmasi yashirin turadi.
  const noteDirty = note !== null && note !== (lead.adminNote ?? '');

  const setStatus = async (status: LeadStatus) => {
    setFailure(null);
    try {
      await update.mutateAsync({ id: lead.id, status });
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  const saveNote = async () => {
    if (!noteDirty) return;
    setFailure(null);

    try {
      await update.mutateAsync({ id: lead.id, adminNote: note || null });
      setNote(null);
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{lead.name}</p>
          <p className="text-sm text-muted-foreground">
            {/* Raqamga bosilsa qo'ng'iroq boshlanadi — admin ko'pincha shu yerdan qo'ng'iroq qiladi. */}
            <a href={`tel:${lead.phone}`} className="hover:underline">
              {lead.phone}
            </a>
            {` · ${lead.source} · ${formatDate(lead.createdAt, locale)}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setStatus(code)}
              disabled={update.isPending}
              aria-pressed={lead.status === code}
              className={cn(
                'rounded-lg border px-2 py-1 text-xs transition-colors disabled:opacity-60',
                lead.status === code
                  ? TONE[code]
                  : 'border-transparent text-muted-foreground hover:bg-muted',
              )}
            >
              {t(`statuses.${code}` as never)}
            </button>
          ))}
        </div>
      </div>

      {lead.message ? (
        <p className="whitespace-pre-line rounded-lg bg-muted/40 px-3 py-2 text-sm">
          {lead.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <textarea
          value={note ?? lead.adminNote ?? ''}
          rows={2}
          placeholder={t('notePlaceholder')}
          onChange={(event) => setNote(event.target.value)}
          className="w-full min-w-0 rounded-lg border bg-background px-3 py-2 text-sm"
        />

        {failure ? <p className="text-xs text-destructive">{failure}</p> : null}

        <div className="flex flex-wrap items-center gap-2">
          {noteDirty ? (
            <Button size="sm" onClick={saveNote} disabled={update.isPending}>
              {update.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {t('saveNote')}
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            className="ms-auto text-destructive"
            disabled={remove.isPending}
            onClick={() => remove.mutate(lead.id)}
          >
            <Trash2 className="size-4" />
            {t('delete')}
          </Button>
        </div>
      </div>
    </li>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-lg border px-2.5 py-1 text-sm transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'hover:border-foreground/30 hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}
