'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, FileText, Loader2, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { errorFrom } from '@/lib/errors';
import { formatBytes, formatDate } from '@/lib/formatters';
import { exportAdminService } from '@/lib/services';
import { cn } from '@/lib/utils';
import type { ProjectExportRow } from '@/types/domain';

/**
 * Loyihadan generatsiya qilingan fayllar — PDF va 3D rasmlar.
 *
 * Media kutubxonasidan ALOHIDA. Bular kesh: geometriya o'zgarsa
 * eskisi yaroqsiz bo'ladi va 30 kundan keyin o'zi o'chadi. Yuklangan
 * fayllar esa kontent va hech qachon o'z-o'zidan yo'qolmaydi.
 *
 * Ularni bir ro'yxatga qo'shish "yetim fayl" hisobini buzardi:
 * eksport `ProjectExport` orqali ishlatiladi va `findOrphans` buni
 * ko'rmaydi — ya'ni har bir eksport yetim deb belgilanib, tozalashda
 * o'chib ketardi.
 */

const KEY = ['project-exports'] as const;

const KINDS = ['PDF', 'RENDER'] as const;

export function ExportList() {
  const t = useTranslations('admin.exports');
  const locale = useLocale();
  const queryClient = useQueryClient();

  const [kind, setKind] = useState<string>('');
  const [page, setPage] = useState(1);
  const [failure, setFailure] = useState<string | null>(null);

  const exports = useQuery({
    queryKey: [...KEY, kind, page],
    queryFn: () => exportAdminService.list({ page, ...(kind ? { kind } : {}) }),
    staleTime: 15_000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: KEY });

  const remove = useMutation({
    mutationFn: (id: string) => exportAdminService.remove(id),
    onSuccess: invalidate,
    onError: (error) => setFailure(errorFrom(error).message),
  });

  const purge = useMutation({
    mutationFn: () => exportAdminService.purgeExpired(),
    onSuccess: invalidate,
    onError: (error) => setFailure(errorFrom(error).message),
  });

  const rows = exports.data?.data ?? [];
  const meta = exports.data?.meta;

  const expired = (row: ProjectExportRow) =>
    Boolean(row.expires_at) && new Date(row.expires_at!) < new Date();

  return (
    <section className="flex flex-col gap-4">
      <header>
        <h2 className="text-lg font-medium">{t('title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={kind === ''} onClick={() => { setKind(''); setPage(1); }}>
            {t('all')}
          </Chip>
          {KINDS.map((code) => (
            <Chip key={code} active={kind === code} onClick={() => { setKind(code); setPage(1); }}>
              {t(`kinds.${code}` as never)}
            </Chip>
          ))}
        </div>

        {meta ? (
          <span className="text-sm text-muted-foreground">
            {t('total', { count: meta.total })} · {formatBytes(meta.bytes, locale)}
          </span>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          className="ms-auto text-destructive"
          onClick={() => purge.mutate()}
          disabled={purge.isPending}
        >
          {purge.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          {t('purgeExpired')}
        </Button>
      </div>

      {failure ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {failure}
        </p>
      ) : null}

      {exports.isPending ? (
        <div className="h-48 animate-pulse rounded-xl border bg-muted/30" />
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <thead className="bg-muted/40 text-start">
              <tr>
                <th className="px-3 py-2 text-start font-medium">{t('kind')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('project')}</th>
                <th className="px-3 py-2 text-end font-medium">{t('size')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('created')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('expires')}</th>
                <th className="w-10" />
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={cn('border-t', expired(row) && 'opacity-55')}>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1.5">
                      {row.kind === 'RENDER' ? (
                        <Box className="size-3.5 text-muted-foreground" />
                      ) : (
                        <FileText className="size-3.5 text-muted-foreground" />
                      )}
                      {t(`kinds.${row.kind}` as never)}
                    </span>
                  </td>

                  <td className="min-w-0 px-3 py-2">
                    <p className="truncate">{row.project?.title ?? '—'}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.project?.user?.email ?? ''}
                    </p>
                  </td>

                  <td className="px-3 py-2 text-end font-mono tabular-nums">
                    {formatBytes(row.size_bytes, locale)}
                  </td>

                  <td className="px-3 py-2 text-muted-foreground">
                    {formatDate(row.created_at, locale)}
                  </td>

                  <td className="px-3 py-2 text-muted-foreground">
                    {row.expires_at ? (
                      <span className={cn(expired(row) && 'text-destructive')}>
                        {expired(row) ? t('expiredAt') : formatDate(row.expires_at, locale)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="px-3 py-2">
                    <button
                      type="button"
                      aria-label={t('remove')}
                      onClick={() => remove.mutate(row.id)}
                      disabled={remove.isPending}
                      className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.pages > 1 ? (
        <div className="flex items-center justify-between gap-2 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>
            {t('prev')}
          </Button>
          <span className="tabular-nums text-muted-foreground">
            {meta.page} / {meta.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.pages}
            onClick={() => setPage((v) => v + 1)}
          >
            {t('next')}
          </Button>
        </div>
      ) : null}
    </section>
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
