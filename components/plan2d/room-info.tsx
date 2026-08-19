'use client';

import { useTranslations } from 'next-intl';
import type { Room } from '@/lib/geometry/types';
import { formatArea, formatNumber } from '@/lib/formatters';

interface Props {
  room: Room;
  name: string;
  children?: React.ReactNode;
}

export function RoomInfo({ room, name, children }: Props) {
  const t = useTranslations('plan');

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{room.label ?? name}</p>
        <p className="text-xs text-muted-foreground">{name}</p>
      </div>

      <dl className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <Field label={t('roomArea')} value={formatArea(room.area)} />
        <Field
          label={t('roomSize')}
          value={`${formatNumber(room.rect.width)} × ${formatNumber(room.rect.length)} m`}
        />
        <Field label={t('roomRatio')} value={`${formatNumber(room.ratio)} : 1`} />
      </dl>

      {children ? <div className="ms-auto flex items-center gap-2">{children}</div> : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-mono tabular-nums">{value}</dd>
    </div>
  );
}
