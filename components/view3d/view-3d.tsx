'use client';

import { Box, Download, Home, ImageDown, Layers, Loader2, Lock, Sofa } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { House } from '@/lib/geometry/types';
import { usePlanLimits } from '@/hooks/use-billing';
import { useProjectRender } from '@/hooks/use-export';
import { Link } from '@/i18n/navigation';
import { errorFrom } from '@/lib/errors';
import type { StyleAppearance } from '@/lib/shared/palette';
import { cn } from '@/lib/utils';

const House3D = dynamic(() => import('@/components/view3d/house-3d').then((m) => m.House3D), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

type ViewMode = 'exterior' | 'cutaway' | 'interior';

interface Props {
  house: House;
  appearance?: StyleAppearance | null;
  projectId?: string;
  className?: string;
}

export function View3D({ house, appearance = null, projectId, className }: Props) {
  const t = useTranslations('view3d');

  const [mode, setMode] = useState<ViewMode>('exterior');
  const [floor, setFloor] = useState<number | null>(null);

  const multiFloor = house.floors.length > 1;

  const limits = usePlanLimits();
  const interiorLocked = limits !== null && !limits.interior;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <div className="inline-flex rounded-lg bg-muted p-0.75" role="group" aria-label={t('mode')}>
            <ModeButton active={mode === 'exterior'} onClick={() => setMode('exterior')}>
              <Home className="size-4" />
              {t('exterior')}
            </ModeButton>
            <ModeButton active={mode === 'cutaway'} onClick={() => setMode('cutaway')}>
              <Box className="size-4" />
              {t('cutaway')}
            </ModeButton>
            {interiorLocked ? (
              <Link
                href="/pricing"
                title={t('interiorLocked')}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Lock className="size-3.5" />
                {t('interior')}
              </Link>
            ) : (
              <ModeButton active={mode === 'interior'} onClick={() => setMode('interior')}>
                <Sofa className="size-4" />
                {t('interior')}
              </ModeButton>
            )}
          </div>

          {multiFloor ? (
            <div className="ms-1 inline-flex rounded-lg bg-muted p-0.75" role="group" aria-label={t('floors')}>
              <FloorButton active={floor === null} onClick={() => setFloor(null)}>
                {t('allFloors')}
              </FloorButton>
              {house.floors.map((item) => (
                <FloorButton
                  key={item.level}
                  active={floor === item.level}
                  onClick={() => setFloor(item.level)}
                >
                  {item.level}
                </FloorButton>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {projectId ? <RenderButton projectId={projectId} mode={mode} /> : null}

          <p className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <Layers className="size-3.5" />
            {t('hint')}
          </p>
        </div>
      </div>

      <div className="h-[28rem] overflow-hidden rounded-xl border bg-muted/30 sm:h-[34rem]">
        <House3D
          house={house}
          mode={mode}
          floor={floor}
          appearance={appearance}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}

function RenderButton({ projectId, mode }: { projectId: string; mode: ViewMode }) {
  const t = useTranslations('view3d');
  const render = useProjectRender(projectId);

  if (render.url && render.view === mode) {
    return (
      <a
        href={render.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
      >
        <Download className="size-3.5" />
        {t('renderReady')}
      </a>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => render.request(mode)}
        disabled={render.pending}
        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
      >
        {render.pending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <ImageDown className="size-3.5" />
        )}
        {render.pending ? t('rendering') : t('renderImage')}
      </button>

      {render.timedOut ? <p className="text-xs text-destructive">{t('renderTimeout')}</p> : null}
      {render.error ? (
        <p className="text-xs text-destructive">{errorFrom(render.error).message}</p>
      ) : null}
    </div>
  );
}

function ModeButton({
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
        'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function FloorButton({
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
        'rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
        active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
