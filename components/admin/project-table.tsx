'use client';

import { ExternalLink, Loader2, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { PlanCover } from '@/components/plan2d/plan-cover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useAdminDeleteProject,
  useAdminProjects,
  useAdminRestoreProject,
} from '@/hooks/use-admin-projects';
import { Link } from '@/i18n/navigation';
import { errorFrom } from '@/lib/errors';
import { formatDate, formatSumShort, translated } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { AdminProject } from '@/types/domain';

/**
 * Loyihalar — admin ko'rinishi.
 *
 * TAHRIRLASH YO'Q. Admin boshqa odamning rejasini o'zgartirmasligi
 * kerak: u odam ertaga o'z loyihasini ochib, o'zi qilmagan
 * o'zgarishni ko'rsa, platformaga ishonchi yo'qoladi. Ko'rish va
 * o'chirish yetadi, va o'chirish jurnalga tushadi.
 *
 * O'chirish YUMSHOQ: loyiha 30 kun tiklanadi. Shuning uchun bu yerda
 * "savatcha" ham bor — "loyiham yo'qoldi" degan murojaatga javob
 * berish uchun admin uni ko'rishi kerak.
 */

const FILTERS = [
  { code: 'exclude', key: 'active' },
  { code: 'only', key: 'deleted' },
  { code: 'include', key: 'all' },
] as const;

export function ProjectTable() {
  const t = useTranslations('admin.projects');

  const [search, setSearch] = useState('');
  const [deleted, setDeleted] = useState<string>('exclude');
  const [page, setPage] = useState(1);

  const projects = useAdminProjects({
    page,
    deleted,
    ...(search.trim() ? { search: search.trim() } : {}),
  });

  const rows = projects.data?.data ?? [];
  const meta = projects.data?.meta;

  return (
    <div className="flex flex-col gap-4">
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
          {FILTERS.map((filter) => (
            <button
              key={filter.code}
              type="button"
              aria-pressed={deleted === filter.code}
              onClick={() => {
                setDeleted(filter.code);
                setPage(1);
              }}
              className={cn(
                'rounded-lg border px-2.5 py-1 text-sm transition-colors',
                deleted === filter.code
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'hover:border-foreground/30 hover:bg-muted',
              )}
            >
              {t(`filters.${filter.key}` as never)}
            </button>
          ))}
        </div>

        {meta ? (
          <span className="ms-auto text-sm tabular-nums text-muted-foreground">
            {t('total', { count: meta.total })}
          </span>
        ) : null}
      </div>

      {projects.isPending ? (
        <div className="h-64 animate-pulse rounded-xl border bg-muted/30" />
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((project) => (
            <ProjectCard key={project.id} project={project} />
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

function ProjectCard({ project }: { project: AdminProject }) {
  const t = useTranslations('admin.projects');
  const locale = useLocale();

  const remove = useAdminDeleteProject();
  const restore = useAdminRestoreProject();

  const [failure, setFailure] = useState<string | null>(null);
  const isDeleted = Boolean(project.deleted_at);

  const act = async (run: () => Promise<unknown>) => {
    setFailure(null);
    try {
      await run();
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  return (
    <li
      className={cn(
        'flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4',
        // O'chirilgan loyiha ko'zga boshqacha ko'rinishi kerak — aks
        // holda admin uni tirik deb o'ylab, egasiga noto'g'ri javob
        // berardi.
        isDeleted && 'border-dashed opacity-70',
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{project.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {project.user ? `${project.user.fullName} · ${project.user.email}` : t('noOwner')}
          </p>
        </div>

        {isDeleted ? (
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {t('deletedAt', { date: formatDate(project.deleted_at!, locale) })}
          </span>
        ) : null}
      </div>

      {project.cover_svg ? <PlanCover svg={project.cover_svg} /> : null}

      <dl className="flex items-end justify-between gap-2 text-sm">
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">{t('style')}</dt>
          <dd className="truncate">
            {project.style ? translated(project.style.name, locale) : '—'}
          </dd>
        </div>

        <div className="text-end">
          <dt className="text-xs text-muted-foreground">{t('sum')}</dt>
          <dd className="tabular-nums">{formatSumShort(project.estimate_total, locale)}</dd>
        </div>
      </dl>

      <p className="text-xs text-muted-foreground">
        {t('updated', { date: formatDate(project.updated_at, locale) })}
      </p>

      {failure ? <p className="text-xs text-destructive">{failure}</p> : null}

      <div className="flex flex-wrap items-center gap-2 border-t pt-3">
        {/*
          Ochish oddiy havola: `byId` da admin uchun ruxsat allaqachon
          bor, ya'ni bu yerda alohida uch kerak emas. O'chirilgan
          loyiha esa ochilmaydi — `byId` uni topmaydi.
        */}
        {!isDeleted ? (
          <Link
            href={{ pathname: '/loyiha/[id]', params: { id: project.id } }}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="size-3.5" />
            {t('open')}
          </Link>
        ) : null}

        {isDeleted ? (
          <Button
            variant="ghost"
            size="sm"
            className="ms-auto"
            disabled={restore.isPending}
            onClick={() => act(() => restore.mutateAsync(project.id))}
          >
            {restore.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RotateCcw className="size-4" />
            )}
            {t('restore')}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="ms-auto text-destructive"
            disabled={remove.isPending}
            onClick={() => act(() => remove.mutateAsync(project.id))}
          >
            {remove.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {t('delete')}
          </Button>
        )}
      </div>
    </li>
  );
}
