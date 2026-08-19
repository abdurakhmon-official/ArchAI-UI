'use client';

import { Box, FileDown, History, Loader2, PencilRuler, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Editor } from '@/components/editor/editor';
import { VersionHistory } from '@/components/project/version-history';
import { EstimateTable } from '@/components/estimate/estimate-table';
import { View3D } from '@/components/view3d/view-3d';
import { Button } from '@/components/ui/button';
import { usePriceBook } from '@/hooks/use-catalog';
import { useProjectPdf } from '@/hooks/use-export';
import type { RoomTypeRule } from '@/lib/geometry/types';
import { errorFrom } from '@/lib/errors';
import { houseFrom } from '@/lib/house';
import { appearanceOf } from '@/lib/palette';
import { cn } from '@/lib/utils';
import type { EstimateResult, EstimateSelection, GeometryState, Style } from '@/types/domain';

type Tab = 'plan' | 'view' | 'estimate' | 'history';

interface Props {
  projectId: string;
  geometry: GeometryState;
  rules: Record<string, RoomTypeRule>;
  names: Record<string, string>;
  style?: Style | null;
  estimate?: EstimateResult | null;
  selection?: EstimateSelection | null;
  finishLevel?: string;
  onSaveSelection?: (selection: EstimateSelection) => void;
  savingSelection?: boolean;
  onChange?: (geometry: GeometryState) => void;
}

export function ProjectTabs({
  projectId,
  geometry,
  rules,
  names,
  style,
  estimate,
  selection,
  finishLevel = 'standard',
  onSaveSelection,
  savingSelection,
  onChange,
}: Props) {
  const t = useTranslations('project');
  const [tab, setTab] = useState<Tab>('plan');

  const prices = usePriceBook(finishLevel, tab === 'estimate');

  const house = useMemo(() => {
    if (!Object.keys(rules).length) return null;
    return houseFrom(geometry, { rules, style });
  }, [geometry, rules, style]);

  const pdf = useProjectPdf(projectId);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'plan', label: t('tabs.plan'), icon: <PencilRuler className="size-4" /> },
    { id: 'view', label: t('tabs.view'), icon: <Box className="size-4" /> },
    { id: 'estimate', label: t('tabs.estimate'), icon: <Wallet className="size-4" /> },
    { id: 'history', label: t('tabs.history'), icon: <History className="size-4" /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="inline-flex rounded-lg bg-muted p-0.75">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === item.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <PdfButton pdf={pdf} />
      </div>

      {}
      <div className={tab === 'plan' ? undefined : 'hidden'}>
        <Editor geometry={geometry} rules={rules} names={names} style={style} onChange={onChange} />
      </div>

      {tab === 'view' ? (
        house ? (
          <View3D house={house} appearance={appearanceOf(style)} projectId={projectId} />
        ) : (
          <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />
        )
      ) : null}

      {tab === 'history' ? <VersionHistory projectId={projectId} /> : null}

      {tab === 'estimate' ? (
        estimate ? (
          <EstimateTable
            estimate={estimate}
            book={prices.book}
            selection={selection}
            onSave={onSaveSelection}
            saving={savingSelection}
          />
        ) : (
          <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
            {t('noEstimate')}
          </p>
        )
      ) : null}
    </div>
  );
}

function PdfButton({ pdf }: { pdf: ReturnType<typeof useProjectPdf> }) {
  const t = useTranslations('project');

  if (pdf.url) {
    return (
      <Button
        size="sm"
        nativeButton={false}
        render={<a href={pdf.url} target="_blank" rel="noopener noreferrer" />}
      >
        <FileDown className="size-4" />
        {t('downloadReady')}
      </Button>
    );
  }

  const detail = pdf.error ? errorFrom(pdf.error) : null;

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" onClick={pdf.request} disabled={pdf.pending}>
        {pdf.pending ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
        {pdf.pending ? t('preparing') : t('download')}
      </Button>

      {pdf.timedOut ? <p className="text-xs text-destructive">{t('pdfTimeout')}</p> : null}

      {detail ? (
        <p className="text-xs text-destructive">
          {detail.code === 'PLAN_LIMIT' ? t('pdfLocked') : detail.message}
        </p>
      ) : null}
    </div>
  );
}
