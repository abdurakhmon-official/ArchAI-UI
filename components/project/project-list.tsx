'use client';

import { Plus, Search, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { PlanCover } from '@/components/plan2d/plan-cover';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDeleteProject, useProjects } from '@/hooks/use-projects';
import { formatDate, formatSumShort, translated } from '@/lib/formatters';

export function ProjectList() {
  const t = useTranslations('cabinet');
  const tp = useTranslations('project');
  const locale = useLocale();

  const [search, setSearch] = useState('');
  const projects = useProjects({ search: search.trim() || undefined });
  const remove = useDeleteProject();

  const items = projects.data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>

        {}
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="relative min-w-40 flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              placeholder={t('search')}
              onChange={(event) => setSearch(event.target.value)}
              className="h-8 w-full ps-8 sm:w-44"
              aria-label={t('search')}
            />
          </div>

          <ButtonLink size="sm" href="/constructor" className="shrink-0">
            <Plus className="size-4" />
            {t('emptyCta')}
          </ButtonLink>
        </div>
      </header>

      {projects.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-72 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <p className="font-medium">{t('empty')}</p>
          <ButtonLink size="sm" href="/constructor" className="mt-4">
            <Plus className="size-4" />
            {t('emptyCta')}
          </ButtonLink>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{project.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('updated')}: {formatDate(project.updatedAt, locale)}
                    </p>
                  </div>

                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={t('delete')}
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (window.confirm(t('deleteConfirm'))) remove.mutate(project.id);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {project.coverSvg ? <PlanCover svg={project.coverSvg} /> : null}

                {}
                <dl className="flex items-center justify-between text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">{t('style')}</dt>
                    <dd>{project.style ? translated(project.style.name, locale) : '—'}</dd>
                  </div>
                  <div className="text-end">
                    <dt className="text-xs text-muted-foreground">{t('price')}</dt>
                    <dd className="font-mono tabular-nums">
                      {formatSumShort(project.estimateTotal, locale)}
                    </dd>
                  </div>
                </dl>
              </CardContent>

              <CardFooter>
                <ButtonLink
                  className="w-full"
                  href={{ pathname: '/project/[id]', params: { id: project.id } }}
                >
                  {tp('openProject')}
                </ButtonLink>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
