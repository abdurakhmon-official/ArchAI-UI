'use client';

import { AlertTriangle, ArrowLeft, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Editor } from '@/components/editor/editor';
import { SaveProject } from '@/components/editor/save-project';
import { GenerationProgress } from '@/components/results/generation-progress';
import { VariantCard } from '@/components/results/variant-card';
import { VariantCompare } from '@/components/results/variant-compare';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { useSession } from '@/hooks/use-auth';
import { useRoomTypes } from '@/hooks/use-catalog';
import { useGenerate } from '@/hooks/use-generate';
import { useStyles } from '@/hooks/use-catalog';
import { fromSearchParams, toGenerateParams, toSearchParams } from '@/lib/constructor';
import { errorFrom } from '@/lib/errors';
import type { Variant } from '@/types/domain';
import { messageFor } from '@/lib/server-messages';

export function ResultsView() {
  const t = useTranslations('results');
  const search = useSearchParams();

  const params = useMemo(() => fromSearchParams(new URLSearchParams(search.toString())), [search]);

  const generation = useGenerate(params);
  const roomTypes = useRoomTypes();
  const { isAuthenticated } = useSession();
  const styles = useStyles();

  const [openId, setOpenId] = useState<string | null>(null);

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const opened = generation.data?.variants.find((variant) => variant.id === openId) ?? null;

  if (generation.isPending) return <GenerationProgress />;

  if (generation.isError) {
    return <Failure error={generation.error} onRetry={() => generation.refetch()} params={params} />;
  }

  const { variants, relaxed, message, messageValues, variantLimit } = generation.data;

  const compared = variants.filter((variant) => compareIds.includes(variant.id));

  const universallySkipped =
    variants.length === 0
      ? []
      : (variants[0].steps.skipped ?? [])
          .filter((item) =>
            variants.every((variant) =>
              (variant.steps.skipped ?? []).some((other) => other.roomType === item.roomType),
            ),
          )
          .map((item) => ({
            ...item,
            placed: Math.max(
              ...variants.map(
                (variant) =>
                  (variant.steps.skipped ?? []).find((other) => other.roomType === item.roomType)
                    ?.placed ?? item.placed,
              ),
            ),
          }));

  if (opened) {
    return (
      <OpenedVariant
        variant={opened}
        names={roomTypes.names}
        rules={roomTypes.rules}
        styleSlug={params.styleSlug}
        styles={styles.data ?? []}
        params={params}
        onBack={() => setOpenId(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('count', { count: variants.length })}</p>
        </div>

        <div className="flex gap-2">
          <ButtonLink
            variant="outline"
            size="sm"
            href={{
              pathname: '/konstruktor',
              query: Object.fromEntries(toSearchParams(params)),
            }}
          >
            <SlidersHorizontal className="size-4" />
            {t('change')}
          </ButtonLink>
        </div>
      </header>

      {relaxed ? (
        <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          {messageFor(message, undefined, messageValues) ?? t('relaxed')}
        </p>
      ) : null}

      {}
      {universallySkipped.length > 0 ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm">
          <p className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-4 shrink-0" />
            {t('doesNotFit')}
          </p>
          <p className="mt-1 text-muted-foreground">
            {universallySkipped
              .map((item) =>
                t('skippedRoom', {
                  room: roomTypes.names[item.roomType] ?? item.roomType,
                  placed: item.placed,
                  wanted: item.wanted,
                }),
              )
              .join(', ')}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t('doesNotFitHint')}</p>
        </div>
      ) : null}

      {variants.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <p className="font-medium">{t('empty')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('emptyHint')}</p>
        </div>
      ) : (
        <>
          {compared.length >= 2 ? (
            <VariantCompare
              variants={compared}
              onOpen={(item) => setOpenId(item.id)}
              onClose={() => setCompareIds([])}
              onRemove={(id) => setCompareIds((current) => current.filter((item) => item !== id))}
            />
          ) : null}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {variants.map((variant, index) => (
            <VariantCard
              key={variant.id}
              variant={variant}
              index={index}
              names={roomTypes.names}
              comparing={compareIds.includes(variant.id)}
              onCompare={() =>
                setCompareIds((current) =>
                  current.includes(variant.id)
                    ? current.filter((id) => id !== variant.id)
                    : [...current, variant.id],
                )
              }
              onOpen={(item) => setOpenId(item.id)}
            />
          ))}
        </div>
        </>
      )}

      {/*
        Variant chegarasi.

        Mehmon uchun yechim — ro'yxatdan o'tish, kirgan foydalanuvchi
        uchun esa tarifni ko'tarish. Ilgari ikkalasiga ham "ro'yxatdan
        o'ting" chiqardi va allaqachon kirgan odam nima qilishini
        tushunmasdi.
      */}
      {variants.length < params.variants && variantLimit <= variants.length ? (
        <div className="rounded-xl border border-dashed px-6 py-8 text-center">
          <p className="font-medium">
            {t('locked', { count: params.variants - variants.length })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAuthenticated ? t('lockedPlanHint') : t('lockedHint')}
          </p>
          <ButtonLink
            size="sm"
            href={isAuthenticated ? '/narxlash' : '/royxatdan-otish'}
            className="mt-4"
          >
            {isAuthenticated ? t('upgrade') : t('signUp')}
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}

interface OpenedProps {
  variant: Variant;
  names: Record<string, string>;
  rules: ReturnType<typeof useRoomTypes>['rules'];
  styleSlug?: string;
  styles: NonNullable<ReturnType<typeof useStyles>['data']>;
  params: ReturnType<typeof fromSearchParams>;
  onBack: () => void;
}

function OpenedVariant({ variant, names, rules, styleSlug, styles, params, onBack }: OpenedProps) {
  const t = useTranslations('results');

  const style = styles.find((item) => item.slug === (variant.styleSlug || styleSlug)) ?? null;

  const [geometry, setGeometry] = useState(variant.geometry);

  const [lastVariantId, setLastVariantId] = useState(variant.id);

  if (lastVariantId !== variant.id) {
    setLastVariantId(variant.id);
    setGeometry(variant.geometry);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          {t('backToList')}
        </Button>

        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{variant.skeletonName}</p>
          <SaveProject
            params={toGenerateParams(params)}
            geometry={geometry}
            defaultTitle={variant.skeletonName}
            styleSlug={variant.styleSlug || styleSlug}
            skeletonId={variant.skeletonId}
          />
        </div>
      </div>

      {}
      <Editor
        key={variant.id}
        geometry={variant.geometry}
        rules={rules}
        names={names}
        style={style}
        onChange={setGeometry}
      />
    </div>
  );
}

function Failure({
  error,
  onRetry,
  params,
}: {
  error: unknown;
  onRetry: () => void;
  params: ReturnType<typeof fromSearchParams>;
}) {
  const t = useTranslations('results');
  const tc = useTranslations('common');
  const detail = errorFrom(error);

  return (
    <div className="rounded-xl border border-dashed px-6 py-16 text-center">
      <p className="font-medium">{detail.message || tc('error')}</p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" />
          {tc('retry')}
        </Button>

        <ButtonLink
          size="sm"
          href={{ pathname: '/konstruktor', query: Object.fromEntries(toSearchParams(params)) }}
        >
          <SlidersHorizontal className="size-4" />
          {t('change')}
        </ButtonLink>
      </div>
    </div>
  );
}
