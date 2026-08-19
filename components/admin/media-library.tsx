'use client';

import { AlertTriangle, ExternalLink, FileText, Image as ImageIcon, Loader2, Package, Search, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDeleteMedia, useMedia, useOrphans, usePurgeOrphans } from '@/hooks/use-media';
import { errorFrom } from '@/lib/errors';
import { formatBytes, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { MediaFile, MediaType } from '@/types/domain';

/**
 * Media kutubxonasi.
 *
 * `GET /s3/media`, `findOrphans` va `purgeOrphans` tayyor edi, ekrani
 * yo'q edi — ya'ni yuklangan fayllarni ko'rish va o'chirishning hech
 * qanday yo'li yo'q edi va saqlash joyi jimgina to'lib borardi.
 *
 * Yetim fayllar alohida bo'limda va ular FAQAT so'ralganda
 * hisoblanadi: `findOrphans` bir necha jadvalni ko'zdan kechiradi.
 *
 * Diqqat: bu yerda faqat YUKLANGAN fayllar ko'rinadi. PDF va 3D
 * rasmlar `ProjectExport` orqali boshqariladi va shu sahifadagi
 * alohida bo'limda ko'rsatiladi (`ExportList`).
 */

/*
  Belgi tipi aniq: `React.ElementType` propslarni `never` ga
  keltiradi va `className` uzatib bo'lmay qoladi.
*/
const TYPES: Array<{ code: MediaType; icon: React.ComponentType<{ className?: string }> }> = [
  { code: 'IMAGE', icon: ImageIcon },
  { code: 'MODEL', icon: Package },
  { code: 'DOCUMENT', icon: FileText },
];

/** Yetim deb hisoblash uchun eng kam yosh — kunlarda. */
const AGE_OPTIONS = [1, 7, 30];

export function MediaLibrary() {
  const t = useTranslations('admin.media');

  const [search, setSearch] = useState('');
  const [type, setType] = useState<string>('');
  const [page, setPage] = useState(1);

  const media = useMedia({
    page,
    ...(type ? { type } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  });

  const rows = media.data?.data ?? [];
  const meta = media.data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-full flex-wrap items-center gap-2">
        <div className="relative min-w-40 flex-1 sm:max-w-72">
          <Search className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            placeholder={t('search')}
            className="ps-8"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Chip active={type === ''} onClick={() => { setType(''); setPage(1); }}>
            {t('allTypes')}
          </Chip>
          {TYPES.map((item) => (
            <Chip
              key={item.code}
              active={type === item.code}
              onClick={() => { setType(item.code); setPage(1); }}
            >
              <item.icon className="size-3.5" />
              {t(`types.${item.code}` as never)}
            </Chip>
          ))}
        </div>

        {meta ? (
          <span className="ms-auto text-sm tabular-nums text-muted-foreground">
            {t('total', { count: meta.total })}
          </span>
        ) : null}
      </div>

      {media.isPending ? (
        <div className="h-64 animate-pulse rounded-xl border bg-muted/30" />
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((file) => (
            <MediaCard key={file.id} file={file} />
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

      <Orphans />
    </div>
  );
}

// ---------------------------------------------------------------------------

function MediaCard({ file }: { file: MediaFile }) {
  const t = useTranslations('admin.media');
  const locale = useLocale();

  const remove = useDeleteMedia();
  const [failure, setFailure] = useState<string | null>(null);

  const drop = async () => {
    setFailure(null);
    try {
      await remove.mutateAsync(file.id);
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  return (
    <li className="flex min-w-0 flex-col gap-2 rounded-xl border bg-card p-3">
      <div className="aspect-4/3 overflow-hidden rounded-lg bg-muted/40">
        {file.type === 'IMAGE' ? (
          /*
            `next/image` ishlatilmaydi: manba S3 yoki mahalliy disk va
            uning xosti sozlamalarda oldindan ma'lum emas. Optimallash
            bu yerda muhim ham emas — bu ichki asbob.
          */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={file.original_name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {file.type === 'MODEL' ? <Package className="size-8" /> : <FileText className="size-8" />}
          </div>
        )}
      </div>

      <p className="truncate text-sm" title={file.original_name}>
        {file.original_name}
      </p>

      <p className="text-xs text-muted-foreground">
        {formatBytes(file.size, locale)}
        {` · ${formatDate(file.created_at, locale)}`}
      </p>

      <p className="truncate text-xs text-muted-foreground" title={file.uploader?.email}>
        {file.uploader ? file.uploader.fullName : t('unknownUploader')}
      </p>

      {failure ? <p className="text-xs text-destructive">{failure}</p> : null}

      <div className="flex items-center gap-2 border-t pt-2">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="size-3.5" />
          {t('open')}
        </a>

        <Button
          variant="ghost"
          size="sm"
          className="ms-auto text-destructive"
          disabled={remove.isPending}
          onClick={drop}
        >
          {remove.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
          {t('delete')}
        </Button>
      </div>
    </li>
  );
}

/**
 * Yetim fayllar.
 *
 * Ro'yxat SO'RALGANDA yuklanadi va o'chirish ikki qadamda: avval
 * ko'rasan, keyin tasdiqlaysan. Bir bosishda o'chirish xavfli — bu
 * amal qaytarilmaydi va noto'g'ri hisoblangan "yetim" ishlatilayotgan
 * faylni olib ketardi.
 */
function Orphans() {
  const t = useTranslations('admin.media');
  const locale = useLocale();

  const [days, setDays] = useState(7);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const orphans = useOrphans(days, open);
  const purge = usePurgeOrphans();

  const items = orphans.data?.data ?? [];
  const bytes = orphans.data?.meta?.bytes ?? 0;

  const run = async () => {
    setFailure(null);
    try {
      await purge.mutateAsync(days);
      setConfirming(false);
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-dashed p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="size-4 text-amber-500" />
          {t('orphans')}
        </h2>

        <div className="flex flex-wrap gap-1.5">
          {AGE_OPTIONS.map((option) => (
            <Chip
              key={option}
              active={days === option}
              onClick={() => {
                setDays(option);
                setConfirming(false);
              }}
            >
              {t('olderThan', { days: option })}
            </Chip>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="ms-auto"
          onClick={() => {
            setOpen(true);
            setConfirming(false);
          }}
          disabled={orphans.isFetching}
        >
          {orphans.isFetching ? <Loader2 className="size-4 animate-spin" /> : null}
          {t('scan')}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{t('orphansHint')}</p>

      {!open ? null : orphans.isPending ? (
        <div className="h-16 animate-pulse rounded-lg bg-muted/30" />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('noOrphans')}</p>
      ) : (
        <>
          <p className="text-sm">
            {t('orphansFound', { count: items.length, size: formatBytes(bytes, locale) })}
          </p>

          <ul className="max-h-48 overflow-y-auto text-xs text-muted-foreground">
            {items.slice(0, 50).map((item) => (
              <li key={item.id} className="truncate py-0.5">
                {item.original_name} · {formatBytes(item.size, locale)}
              </li>
            ))}
          </ul>

          {failure ? <p className="text-sm text-destructive">{failure}</p> : null}

          {confirming ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-destructive">{t('confirmPurge', { count: items.length })}</p>
              <Button size="sm" variant="destructive" onClick={run} disabled={purge.isPending}>
                {purge.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {t('confirmYes')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                {t('confirmNo')}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="self-start text-destructive"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="size-4" />
              {t('purge')}
            </Button>
          )}
        </>
      )}
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
        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'hover:border-foreground/30 hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}
