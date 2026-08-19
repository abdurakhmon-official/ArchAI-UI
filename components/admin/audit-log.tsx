'use client';

import { ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrap,
} from '@/components/ui/table';
import { useAuditFacets, useAuditLog } from '@/hooks/use-admin-data';
import { errorFrom } from '@/lib/errors';
import { formatDateTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { AuditEntry } from '@/lib/services';

/**
 * Audit jurnali.
 *
 * Yozuvlar Faza 0 dan beri to'planib kelmoqda, lekin ularni ko'rishning
 * yo'li yo'q edi — ya'ni jurnal amalda mavjud emas edi.
 *
 * Eng muhim ustun — farq: "narx 480 000 dan 520 000 ga o'zgardi". Faqat
 * "kimdir nimadir o'zgartirdi" degan yozuv savolga javob bermaydi.
 */

export function AuditLog() {
  const t = useTranslations('admin.audit');
  const locale = useLocale();

  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const facets = useAuditFacets();
  const log = useAuditLog({
    page,
    ...(entity ? { entity } : {}),
    ...(action ? { action } : {}),
  });

  const filter = (next: { entity?: string | null; action?: string | null }) => {
    setPage(1);
    if (next.entity !== undefined) setEntity(next.entity);
    if (next.action !== undefined) setAction(next.action);
  };

  if (log.isError) {
    return (
      <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        {errorFrom(log.error).message}
      </p>
    );
  }

  const rows = log.data?.data ?? [];
  const meta = log.data?.meta;

  return (
    <div className="flex flex-col gap-4">
      {/* --- Filtrlar -------------------------------------------------- */}
      <div className="flex flex-col gap-2">
        <FilterRow
          label={t('entity')}
          options={facets.data?.entities ?? []}
          value={entity}
          onChange={(value) => filter({ entity: value })}
          all={t('all')}
          translate={(code) => label(t, 'entities', code)}
        />
        <FilterRow
          label={t('action')}
          options={facets.data?.actions ?? []}
          value={action}
          onChange={(value) => filter({ action: value })}
          all={t('all')}
          translate={(code) => label(t, 'actions', code)}
        />
      </div>

      {log.isPending ? (
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
                  <TableHead className="text-start">{t('when')}</TableHead>
                  <TableHead className="text-start">{t('who')}</TableHead>
                  <TableHead className="text-start">{t('what')}</TableHead>
                  <TableHead className="text-start">{t('changes')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((entry) => (
                  <Row
                    key={entry.id}
                    entry={entry}
                    locale={locale}
                    open={openId === entry.id}
                    onToggle={() => setOpenId((id) => (id === entry.id ? null : entry.id))}
                  />
                ))}
              </TableBody>
            </Table>
          </TableWrap>

          {meta && meta.pages > 1 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {t('pageOf', { page: meta.page, pages: meta.pages, total: meta.total })}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  {t('prev')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.pages}
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

// ---------------------------------------------------------------------------

/**
 * Kod uchun tarjima — topilmasa kodning o'zi.
 *
 * `entity` va `action` qiymatlari `recordAudit` chaqiruvlaridan keladi
 * va tarjima fayliga qo'shilmagan bo'lishi mumkin. O'shanda xom kod
 * ko'rsatiladi: bu chiroyli emas, lekin jurnal yozuvi yo'qolgandan yoki
 * `admin.audit.entities.xyz` degan xato matndan afzal.
 */
function label(
  t: ReturnType<typeof useTranslations<'admin.audit'>>,
  group: 'entities' | 'actions',
  code: string,
): string {
  const key = `${group}.${code}` as never;
  return t.has(key) ? t(key) : code;
}

function FilterRow({
  label,
  options,
  value,
  onChange,
  all,
  translate,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
  all: string;
  translate: (code: string) => string;
}) {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="me-1 text-xs font-medium uppercase text-muted-foreground">{label}</span>

      <Chip active={value === null} onClick={() => onChange(null)}>
        {all}
      </Chip>

      {options.map((option) => (
        <Chip key={option} active={value === option} onClick={() => onChange(option)}>
          {translate(option)}
        </Chip>
      ))}
    </div>
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
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-lg border px-2.5 py-1 text-xs transition-colors',
        active ? 'border-primary bg-primary/10 text-primary' : 'hover:border-foreground/30 hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}

function Row({
  entry,
  locale,
  open,
  onToggle,
}: {
  entry: AuditEntry;
  locale: string;
  open: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations('admin.audit');
  const fields = entry.diff ? Object.entries(entry.diff) : [];

  return (
    <>
      <TableRow>
        <TableCell className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
          {formatDateTime(entry.created_at, locale)}
        </TableCell>

        <TableCell>
          {entry.actor ? (
            <span title={entry.actor.email}>{entry.actor.fullName}</span>
          ) : (
            /*
              Ijrochi `null` bo'lishi mumkin: `onDelete: SetNull` —
              foydalanuvchi o'chirilgan bo'lsa yozuv qoladi, lekin
              kimligi yo'qoladi. Bu ataylab: jurnal o'chirilmasligi
              kerak.
            */
            <span className="text-muted-foreground">{t('unknownActor')}</span>
          )}
        </TableCell>

        <TableCell>
          <span className="font-medium">
            {label(t, 'actions', entry.action)}
          </span>
          <span className="ms-1.5 text-muted-foreground">
            {label(t, 'entities', entry.entity)}
          </span>
        </TableCell>

        <TableCell>
          {fields.length > 0 ? (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={open}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ChevronDown
                className={cn('size-3.5 transition-transform', open && 'rotate-180')}
                aria-hidden
              />
              {t('fieldCount', { count: fields.length })}
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>
      </TableRow>

      {open && fields.length > 0 ? (
        <TableRow className="bg-muted/20">
          <TableCell colSpan={4} className="px-3 py-3">
            <dl className="flex flex-col gap-1.5 text-xs">
              {fields.map(([field, change]) => (
                <div key={field} className="flex flex-wrap items-baseline gap-2">
                  <dt className="min-w-32 font-mono text-muted-foreground">{field}</dt>
                  <dd className="flex items-center gap-2">
                    <span className="rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-destructive line-through">
                      {short(change.from)}
                    </span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-primary">
                      {short(change.to)}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}

/**
 * Qiymatni bir qatorga sig'diradigan ko'rinish.
 *
 * Daraxt yoki katta JSON to'liq ko'rsatilsa jadval o'qib bo'lmaydigan
 * bo'ladi; qisqartirish esa "o'zgardi" faktini saqlab qoladi.
 */
function short(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value.length > 40 ? `${value.slice(0, 40)}…` : value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  const json = JSON.stringify(value);
  return json.length > 40 ? `${json.slice(0, 40)}…` : json;
}
