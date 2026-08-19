'use client';

import { Loader2, RotateCcw, Save } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { RoomTypePreview } from '@/components/admin/room-type-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrap,
} from '@/components/ui/table';
import { useAllRoomTypes, useUpdateRoomType } from '@/hooks/use-room-types';
import { errorFrom } from '@/lib/errors';
import { formatDecimal, translated } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { RoomType } from '@/types/domain';

/**
 * Xona turlari.
 *
 * Bu jadvaldagi har bir raqam generatorga to'g'ridan-to'g'ri tushadi:
 * `min_area` ni 9 dan 14 ga ko'tarish bundan keyin yaratiladigan hamma
 * uyni o'zgartiradi. Shu sababli o'ng tomonda jonli reja — o'zgarish
 * natijasi SAQLASHDAN OLDIN ko'rinadi, narxlar ekranidagi etalon uy
 * bilan bir xil g'oya.
 *
 * `selectable` alohida ahamiyatga ega: uni yoqmaguncha yangi tur
 * konstruktorda ko'rinmaydi. Koridor va zinapoya esa ataylab o'chirilgan
 * — ularni generator o'zi joylashtiradi.
 */

/** Tahrirlanadigan raqamli maydonlar. */
type Field = 'min_area' | 'max_area' | 'max_count' | 'default_count';

const FIELDS: Field[] = ['min_area', 'max_area', 'max_count', 'default_count'];

/**
 * Saqlanmagan o'zgarishlar.
 *
 * Raqamli maydonlar va `selectable` alohida yozilgan: bittasi
 * `number | boolean` bo'lsa, uni serverga yuborishda har joyda
 * o'girish kerak bo'lardi va tip xatoni ushlamasdi.
 */
type Draft = Record<string, Partial<Record<Field, number>> & { selectable?: boolean }>;

export function RoomTypeTable() {
  const t = useTranslations('admin.roomTypes');
  const locale = useLocale();

  const types = useAllRoomTypes();
  const update = useUpdateRoomType();

  const [draft, setDraft] = useState<Draft>({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const dirty = Object.keys(draft).length > 0;

  const changeNumber = (code: string, field: Field, value: number) => {
    setDraft((current) => ({ ...current, [code]: { ...current[code], [field]: value } }));
  };

  const changeSelectable = (code: string, value: boolean) => {
    setDraft((current) => ({ ...current, [code]: { ...current[code], selectable: value } }));
  };

  const reset = () => {
    setDraft({});
    setFailure(null);
  };

  /**
   * Ketma-ket saqlaymiz, parallel emas.
   *
   * Server har o'zgarishni jurnalga yozadi va `default_count <= max_count`
   * ni mavjud qatorga qarab tekshiradi — parallel yuborilganda bu
   * tekshiruv eskirgan qiymatni ko'rishi mumkin.
   */
  const save = async () => {
    if (!types.data) return;

    setSaving(true);
    setFailure(null);

    try {
      for (const [code, changes] of Object.entries(draft)) {
        const row = types.data.find((item) => item.code === code);
        if (!row) continue;

        await update.mutateAsync({ id: row.id, ...changes });
      }

      setDraft({});
    } catch (error) {
      setFailure(errorFrom(error).message);
    } finally {
      setSaving(false);
    }
  };

  if (types.isPending) {
    return <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />;
  }

  if (types.isError) {
    return (
      <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        {errorFrom(types.error).message}
      </p>
    );
  }

  const rows = types.data ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/*
        `min-w-0` — grid elementi sukut bo'yicha `min-width: auto`,
        ya'ni u ichidagi keng jadvaldan kichrayolmaydi. Natijada
        `overflow-x-auto` o'ramning O'ZI kengayib ketardi va mobilda
        butun sahifa surilardi.
      */}
      <div className="flex min-w-0 flex-col gap-4">
        {failure ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {failure}
          </p>
        ) : null}

        <TableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t('name')}</TableHead>
                <TableHead className="text-center">{t('selectable')}</TableHead>
                <TableHead className="text-end">{t('minArea')}</TableHead>
                <TableHead className="text-end">{t('maxArea')}</TableHead>
                <TableHead className="text-end">{t('maxCount')}</TableHead>
                <TableHead className="text-end">{t('defaultCount')}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row) => {
                const changes = draft[row.code] ?? {};
                const selectable = changes.selectable ?? row.selectable;

                return (
                  <TableRow key={row.code} className={cn(!selectable && 'opacity-60')}>
                    <TableCell>
                      <span className="font-medium">
                        {translated(row.name, locale) || row.code}
                      </span>
                      <span className="ms-2 font-mono text-xs text-muted-foreground">
                        {row.code}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        aria-label={`${translated(row.name, locale)} — ${t('selectable')}`}
                        checked={selectable}
                        onChange={(event) => changeSelectable(row.code, event.target.checked)}
                      />
                    </TableCell>

                    {FIELDS.map((field) => (
                      <TableCell key={field} className="text-end">
                        <NumberField
                          label={`${translated(row.name, locale)} — ${t(field === 'min_area' ? 'minArea' : field === 'max_area' ? 'maxArea' : field === 'max_count' ? 'maxCount' : 'defaultCount')}`}
                          value={changes[field] ?? row[field]}
                          saved={row[field]}
                          step={field.endsWith('area') ? 0.5 : 1}
                          disabled={!selectable && field.endsWith('count')}
                          onChange={(value) => changeNumber(row.code, field, value)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableWrap>

        <p className="text-xs text-muted-foreground">{t('hint')}</p>

        {dirty ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {t('save')}
            </Button>

            <Button variant="ghost" size="sm" onClick={reset} disabled={saving}>
              <RotateCcw className="size-4" />
              {t('reset')}
            </Button>
          </div>
        ) : null}
      </div>

      <RoomTypePreview types={rows} draft={draft} className="lg:sticky lg:top-6 lg:self-start" />
    </div>
  );
}

// ---------------------------------------------------------------------------

/**
 * Raqam maydoni.
 *
 * Saqlangan qiymatdan farq qilsa ajratib ko'rsatiladi — admin nimani
 * o'zgartirganini bir qarashda ko'rishi kerak, ayniqsa jadval katta
 * bo'lganda.
 */
function NumberField({
  label,
  value,
  saved,
  step,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  saved: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const changed = value !== saved;

  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <Input
        type="number"
        min={0}
        step={step}
        aria-label={label}
        disabled={disabled}
        className={cn(
          'w-20 text-end font-mono tabular-nums',
          changed && 'border-primary bg-primary/5',
        )}
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next) && next >= 0) onChange(next);
        }}
      />

      {changed ? (
        <span className="font-mono text-[10px] text-muted-foreground line-through">
          {formatDecimal(saved, { digits: step < 1 ? 1 : 0 })}
        </span>
      ) : null}
    </span>
  );
}

export type { Draft as RoomTypeDraft, Field as RoomTypeField };
export type { RoomType };
