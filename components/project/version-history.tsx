'use client';

import { History, Loader2, RotateCcw } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useProjectVersions, useRestoreVersion } from '@/hooks/use-projects';
import { errorFrom } from '@/lib/errors';
import { formatDateTime, formatSumShort } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/**
 * Tahrir tarixi.
 *
 * Server tomoni to'liq tayyor edi (`ProjectVersion`, `GET /versions`,
 * `restoreVersion`) va hatto `useProjectVersions` ilgagi ham bor edi —
 * lekin uni hech bir komponent chaqirmasdi.
 */

export function VersionHistory({ projectId }: { projectId: string }) {
  const t = useTranslations('project.history');
  const locale = useLocale();

  const versions = useProjectVersions(projectId);
  const restore = useRestoreVersion(projectId);

  const [confirming, setConfirming] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const rows = versions.data ?? [];

  const run = async (versionId: string) => {
    setFailure(null);
    try {
      await restore.mutateAsync(versionId);
      setConfirming(null);
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  if (versions.isPending) {
    return <div className="h-48 animate-pulse rounded-xl border bg-muted/30" />;
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center">
        <History className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">{t('empty')}</p>
        <p className="text-sm text-muted-foreground">{t('emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{t('hint')}</p>

      {failure ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {failure}
        </p>
      ) : null}

      <ol className="flex flex-col gap-2">
        {rows.map((version, index) => (
          <li
            key={version.id}
            className={cn(
              'flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3',
              index === 0 && 'border-primary/40',
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {version.label || t('unnamed')}
                {index === 0 ? (
                  <span className="ms-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                    {t('latest')}
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(version.created_at, locale)}
                {version.estimate_total
                  ? ` · ${formatSumShort(version.estimate_total, locale)}`
                  : ''}
              </p>
            </div>

            {confirming === version.id ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">{t('confirm')}</span>
                <Button size="sm" onClick={() => run(version.id)} disabled={restore.isPending}>
                  {restore.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  {t('confirmYes')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                  {t('confirmNo')}
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFailure(null);
                  setConfirming(version.id);
                }}
              >
                <RotateCcw className="size-4" />
                {t('restore')}
              </Button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
