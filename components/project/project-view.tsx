'use client';

import { Loader2, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ProjectTabs } from '@/components/project/project-tabs';
import { ShareProject } from '@/components/project/share-project';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { useRoomTypes, useStyles } from '@/hooks/use-catalog';
import { useProject, useSaveSelection, useUpdateProject } from '@/hooks/use-projects';
import { errorFrom } from '@/lib/errors';
import { formatDate } from '@/lib/formatters';
import type { GeometryState } from '@/types/domain';
import { useLocale } from 'next-intl';

export function ProjectView({ id }: { id: string }) {
  const t = useTranslations('project');
  const tc = useTranslations('common');
  const locale = useLocale();

  const project = useProject(id);
  const roomTypes = useRoomTypes();
  const styles = useStyles();
  const update = useUpdateProject(id);
  const saveSelection = useSaveSelection(id);

  const [geometry, setGeometry] = useState<GeometryState | null>(null);
  const [dirty, setDirty] = useState(false);

  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  if (project.data && syncedAt !== project.data.updated_at) {
    setSyncedAt(project.data.updated_at);
    setGeometry(project.data.geometry);
    setDirty(false);
  }

  if (project.isPending) {
    return <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />;
  }

  if (project.isError) {
    const detail = errorFrom(project.error);
    return (
      <div className="rounded-xl border border-dashed px-6 py-16 text-center">
        <p className="font-medium">{detail.status === 404 ? t('notFound') : detail.message}</p>
      </div>
    );
  }

  const data = project.data;
  const style = styles.data?.find((item) => item.slug === data.style?.slug) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{data.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t('updatedAt', { date: formatDate(data.updated_at, locale) })}
            {dirty ? ` · ${t('unsaved')}` : ''}
          </p>
        </div>

        <Button
          size="sm"
          disabled={!dirty || update.isPending || !geometry}
          onClick={() =>
            update.mutate(
              { geometry: geometry!, versionLabel: t('editedLabel') },
              { onSuccess: () => setDirty(false) },
            )
          }
        >
          {update.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {dirty ? t('save') : t('saved')}
        </Button>
      </header>

      <ShareProject projectId={id} locale={locale} />

      {}
      {update.isError ? (
        <SaveFailure error={update.error} fallback={tc('error')} />
      ) : null}

      {geometry ? (
        <ProjectTabs
          projectId={id}
          geometry={geometry}
          rules={roomTypes.rules}
          names={roomTypes.names}
          style={style}
          estimate={data.estimate}
          selection={data.estimate_selection}
          finishLevel={data.finish_level}
          onSaveSelection={(selection) => saveSelection.mutate(selection)}
          savingSelection={saveSelection.isPending}
          onChange={(next) => {
            setGeometry(next);
            setDirty(JSON.stringify(next) !== JSON.stringify(data.geometry));
          }}
        />
      ) : null}
    </div>
  );
}

function SaveFailure({ error, fallback }: { error: unknown; fallback: string }) {
  const t = useTranslations('project');
  const detail = errorFrom(error);

  if (detail.code !== 'PLAN_LIMIT') {
    return (
      <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        {detail.message || fallback}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed px-4 py-3">
      <p className="text-sm">{t('editLocked')}</p>
      <ButtonLink size="sm" href="/narxlash">
        {t('upgrade')}
      </ButtonLink>
    </div>
  );
}
