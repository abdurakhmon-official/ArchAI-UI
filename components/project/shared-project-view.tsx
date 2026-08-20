'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Plan2D } from '@/components/plan2d/plan-2d';
import { ButtonLink } from '@/components/ui/button-link';
import { useRoomTypes } from '@/hooks/use-catalog';
import { errorFrom } from '@/lib/errors';
import { formatArea, formatDate, formatSumShort, translated } from '@/lib/formatters';
import { houseFrom } from '@/lib/house';
import { projectService } from '@/lib/services';

/**
 * Ulashilgan loyiha — kirishsiz ko'rish.
 *
 * Tahrirlash ham, yuklab olish ham yo'q: havolani olgan odam
 * ko'pincha pudratchi yoki oila a'zosi va uning hisobi yo'q. Ular
 * uchun rejani ko'rish va summani bilish yetadi.
 */

export function SharedProjectView({ token }: { token: string }) {
  const t = useTranslations('project.shared');
  const locale = useLocale();
  const roomTypes = useRoomTypes();

  const shared = useQuery({
    queryKey: ['shared-project', token],
    queryFn: () => projectService.shared(token),
    retry: false,
  });

  const house = useMemo(() => {
    if (!shared.data || !Object.keys(roomTypes.rules).length) return null;
    return houseFrom(shared.data.geometry, { rules: roomTypes.rules });
  }, [shared.data, roomTypes.rules]);

  if (shared.isPending) {
    return <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />;
  }

  if (shared.isError) {
    const detail = errorFrom(shared.error);

    return (
      <div className="rounded-xl border border-dashed px-6 py-16 text-center">
        <p className="font-medium">{detail.status === 404 ? t('notFound') : detail.message}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('notFoundHint')}</p>
        <ButtonLink size="sm" href="/constructor" className="mt-4">
          {t('createOwn')}
        </ButtonLink>
      </div>
    );
  }

  const data = shared.data;

  return (
    <article className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{data.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate(data.createdAt, locale)}
          {data.style ? ` · ${translated(data.style.name, locale)}` : ''}
        </p>
      </header>

      {house ? (
        <div className="overflow-hidden rounded-xl border bg-background">
          <Plan2D floor={house.floors[0]} names={roomTypes.names} showDimensions />
        </div>
      ) : null}

      <dl className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-4 sm:grid-cols-4">
        <Fact
          label={t('area')}
          value={formatArea(data.estimate?.measurements.FLOOR_AREA ?? 0, locale)}
        />
        <Fact label={t('rooms')} value={String(data.estimate?.measurements.ROOM_COUNT ?? '—')} />
        <Fact label={t('floors')} value={String(house?.floors.length ?? '—')} />
        <Fact label={t('total')} value={formatSumShort(data.estimateTotal, locale)} />
      </dl>

      {data.note ? (
        <p className="whitespace-pre-line rounded-lg bg-muted/40 px-4 py-3 text-sm">{data.note}</p>
      ) : null}

      {/*
        Ulashilgan sahifa — reklama emas, lekin uni ko'rgan odam
        ko'pincha o'ziga ham xohlaydi. Bitta havola yetadi.
      */}
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">{t('cta')}</p>
        <ButtonLink size="sm" href="/constructor">
          {t('createOwn')}
        </ButtonLink>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-mono tabular-nums">{value}</dd>
    </div>
  );
}
