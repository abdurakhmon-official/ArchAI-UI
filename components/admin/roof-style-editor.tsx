'use client';

import { Loader2, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { RoofPreview } from '@/components/admin/roof-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCreateRoofStyle,
  useDeleteRoofStyle,
  useRoofFamilies,
  useRoofStyles,
  useUpdateRoofStyle,
} from '@/hooks/use-roof-styles';
import { usePriceBook } from '@/hooks/use-catalog';
import { errorFrom } from '@/lib/errors';
import { translated } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { RoofStyle } from '@/types/domain';

/**
 * Tom uslublari.
 *
 * Chapda presetlar ro'yxati, o'ngda tanlanganining jonli 3D ko'rinishi.
 * Qiyalikni surganda tom darhol o'zgaradi — bu yerda "saqlab, keyin
 * ko'rish" yo'q, chunki tomni raqamlar bilan tasavvur qilib bo'lmaydi.
 *
 * Shakl (`family`) ro'yxati serverdan keladi, kodda takrorlanmaydi:
 * `geometry/roof.ts` ga yangi shakl qo'shilsa u shu yerda o'zi paydo
 * bo'ladi.
 */

type Draft = Partial<{
  name: { uz: string };
  family: string;
  pitch: number;
  overhang: number;
  upperPitch: number | null;
  breakRatio: number | null;
  coveringId: string | null;
  color: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}>;

export function RoofStyleEditor() {
  const t = useTranslations('admin.roofStyles');
  const locale = useLocale();

  const styles = useRoofStyles();
  const families = useRoofFamilies();
  const prices = usePriceBook('standard');

  const create = useCreateRoofStyle();
  const update = useUpdateRoofStyle();
  const remove = useDeleteRoofStyle();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [failure, setFailure] = useState<string | null>(null);

  const rows = useMemo(() => styles.data ?? [], [styles.data]);

  /**
   * Tanlov ro'yxat kelgach o'rnatiladi va ro'yxat o'zgarganda tekshiriladi.
   *
   * Render paytida, effektda emas: effekt bilan o'ng panel bir lahza
   * bo'sh ko'rinardi.
   */
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0] ?? null;
  if (rows.length > 0 && selectedId !== selected?.id) {
    setSelectedId(selected!.id);
    setDraft({});
  }

  /** Qoralama qo'llangan preset — 3D shundan quriladi. */
  const preview = useMemo(() => {
    if (!selected) return null;
    return { ...selected, ...draft } as RoofStyle;
  }, [selected, draft]);

  /** Tom qoplamalari — `roof_cover` bandidagi materiallar. */
  const coverings = useMemo(
    () => prices.book?.lines.find((line) => line.code === 'roof_cover')?.options ?? [],
    [prices.book],
  );

  const coveringIds = useMemo(() => {
    const item = prices.items.find((row) => row.code === 'roof_cover');
    return new Map((item?.options ?? []).map((option) => [option.code, option.id]));
  }, [prices.items]);

  const dirty = Object.keys(draft).length > 0;

  const change = (patch: Draft) => {
    setFailure(null);
    setDraft((current) => ({ ...current, ...patch }));
  };

  const save = async () => {
    if (!selected || !dirty) return;
    setFailure(null);

    try {
      await update.mutateAsync({ id: selected.id, ...draft });
      setDraft({});
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  const add = async () => {
    setFailure(null);

    try {
      const suffix = Date.now().toString(36).slice(-4);
      const item = await create.mutateAsync({
        code: `tom-${suffix}`,
        name: { uz: t('newName') },
        family: 'gable',
        pitch: 30,
        overhang: 0.5,
      });

      setSelectedId(item.id);
      setDraft({});
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  const drop = async () => {
    if (!selected) return;
    setFailure(null);

    try {
      await remove.mutateAsync(selected.id);
      setSelectedId(null);
      setDraft({});
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  if (styles.isPending) {
    return <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />;
  }

  const family = preview?.family ?? 'gable';
  const isMansard = family === 'mansard';
  const isFlat = family === 'flat';

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* --- Ro'yxat -------------------------------------------------- */}
      <div className="flex flex-col gap-2">
        <ul className="flex flex-col gap-1">
          {rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(row.id);
                  setDraft({});
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors',
                  row.id === selected?.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                )}
              >
                <span className="truncate">{translated(row.name, locale) || row.code}</span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {row.family}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <Button variant="outline" size="sm" onClick={add} disabled={create.isPending}>
          {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          {t('add')}
        </Button>
      </div>

      {/* --- Tahrir va ko'rinish --------------------------------------- */}
      {selected && preview ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          {/* `min-w-0`: grid elementi ichidagi kontentdan kichrayolsin. */}
          <div className="flex min-w-0 flex-col gap-4">
            {failure ? (
              <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {failure}
              </p>
            ) : null}

            <Field label={t('name')}>
              <Input
                value={preview.name?.uz ?? ''}
                onChange={(event) => change({ name: { uz: event.target.value } })}
              />
            </Field>

            <Field label={t('family')} hint={t('familyHint')}>
              <div className="flex flex-wrap gap-1.5">
                {(families.data ?? []).map((family) => (
                  <button
                    key={family}
                    type="button"
                    onClick={() => change({ family })}
                    className={cn(
                      'rounded-lg border px-2.5 py-1.5 text-sm transition-colors',
                      preview.family === family
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'hover:border-foreground/30 hover:bg-muted',
                    )}
                  >
                    {t(`families.${family}` as never)}
                  </button>
                ))}
              </div>
            </Field>

            {/*
              Tekis tomda qiyalik o'qilmaydi: `roof.ts` unga suv oqishi
              uchun o'zgarmas 2° beradi. Surgichni ochiq qoldirish
              adminni chalg'itardi — u qiymatni o'zgartirib, hech nima
              bo'lmaganini ko'rardi.
            */}
            <Slider
              label={t('pitch')}
              hint={isFlat ? t('pitchFlatHint') : undefined}
              value={preview.pitch}
              min={0}
              max={60}
              step={1}
              unit="°"
              disabled={isFlat}
              onChange={(pitch) => change({ pitch })}
            />

            <Slider
              label={t('overhang')}
              value={preview.overhang}
              min={0}
              max={2}
              step={0.1}
              unit=" m"
              onChange={(overhang) => change({ overhang })}
            />

            {/*
              Mansard maydonlari faqat shu shaklda ko'rinadi: boshqa
              shakllarda ular o'qilmaydi va ko'rsatilsa admin ularni
              o'zgartirib, hech nima bo'lmaganini ko'rardi.
            */}
            {isMansard ? (
              <>
                <Slider
                  label={t('upperPitch')}
                  hint={t('upperPitchHint')}
                  value={preview.upperPitch ?? Math.round(preview.pitch / 2.5)}
                  min={0}
                  max={Math.max(preview.pitch - 1, 0)}
                  step={1}
                  unit="°"
                  onChange={(upperPitch) => change({ upperPitch })}
                />

                <Slider
                  label={t('breakRatio')}
                  hint={t('breakRatioHint')}
                  value={preview.breakRatio ?? 0.5}
                  min={0.15}
                  max={0.85}
                  step={0.05}
                  onChange={(breakRatio) => change({ breakRatio })}
                />
              </>
            ) : null}

            <Field label={t('covering')} hint={t('coveringHint')}>
              <div className="flex flex-wrap gap-1.5">
                {coverings.map((option) => {
                  const id = coveringIds.get(option.code) ?? null;
                  const active = (preview.coveringId ?? null) === id;

                  return (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => change({ coveringId: active ? null : id })}
                      className={cn(
                        'rounded-lg border px-2.5 py-1.5 text-sm transition-colors',
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'hover:border-foreground/30 hover:bg-muted',
                      )}
                    >
                      {translated(option.name, locale) || option.code}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label={t('color')}>
              <input
                type="color"
                aria-label={t('color')}
                className="h-9 w-16 cursor-pointer rounded-lg border bg-transparent"
                value={preview.color ?? '#6B4A32'}
                onChange={(event) => change({ color: event.target.value })}
              />
            </Field>

            <div className="flex flex-wrap items-center gap-2 border-t pt-4">
              {dirty ? (
                <>
                  <Button size="sm" onClick={save} disabled={update.isPending}>
                    {update.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    {t('save')}
                  </Button>

                  <Button variant="ghost" size="sm" onClick={() => setDraft({})}>
                    <RotateCcw className="size-4" />
                    {t('reset')}
                  </Button>
                </>
              ) : null}

              <Button
                variant="ghost"
                size="sm"
                className="ms-auto text-destructive"
                onClick={drop}
                disabled={remove.isPending}
              >
                <Trash2 className="size-4" />
                {t('delete')}
              </Button>
            </div>
          </div>

          <RoofPreview roofStyle={preview} className="xl:sticky xl:top-6 xl:self-start" />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/**
 * Suriluvchi raqam.
 *
 * Tugma bilan emas, aynan surgich: qiyalikni tanlash — bu "30 mi 35 mi"
 * degan savol emas, ko'rinishga qarab topiladigan narsa. Yonidagi son
 * esa aniq qiymatni ko'rsatib turadi.
 */
function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  unit = '',
  disabled,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={`slider-${label}`}>{label}</Label>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {step < 1 ? value.toFixed(2) : Math.round(value)}
          {unit}
        </span>
      </div>

      <input
        id={`slider-${label}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        className={cn('w-full accent-primary', disabled && 'cursor-not-allowed opacity-50')}
        onChange={(event) => onChange(Number(event.target.value))}
      />

      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
