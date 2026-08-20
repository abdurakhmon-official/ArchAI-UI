'use client';

import { AlertTriangle, Loader2, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { StylePreview } from '@/components/admin/style-preview';
import { ImageUpload } from '@/components/ui/image-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRoomTypes } from '@/hooks/use-catalog';
import { useRoofStyles } from '@/hooks/use-roof-styles';
import { useAdminStyles, useCreateStyle, useDeleteStyle, useUpdateStyle } from '@/hooks/use-styles';
import type { StyleDraft } from '@/hooks/use-styles';
import { errorFrom } from '@/lib/errors';
import { translated } from '@/lib/formatters';
import { FLOOR_FINISHES } from '@/lib/shared/palette';
import { cn } from '@/lib/utils';
import type { Style } from '@/types/domain';

/**
 * Uy uslublari.
 *
 * `/admin/roof-styles` faqat TOM presetlarini boshqaradi. Uy uslubi
 * esa butun ko'rinishni belgilaydi: fasad va interyer ranglari, deraza
 * proporsiyalari, pol qoplamalari va reja qoidalari. API to'liq tayyor
 * edi, ekrani yo'q edi — ya'ni bazadagi qiymatlarni faqat urug'lantirish
 * skripti orqali o'zgartirish mumkin edi.
 *
 * O'ngda jonli 3D: rang o'zgarganda uy darhol qayta bo'yaladi.
 *
 * JSON bo'laklari (`facade`, `interior`, …) butunligicha yuboriladi —
 * Prisma'da `Json` ustuni qisman yangilanmaydi.
 */

/** Uslubning JSON bo'laklari — o'qish uchun qulay shakl. */
interface Facade {
  material?: string;
  primary?: string;
  accent?: string;
  plinth?: string;
}

interface Window {
  ratio?: number;
  wallAreaRatio?: number;
  frameColor?: string;
  panoramic?: boolean;
}

interface Interior {
  ceilingHeight?: number;
  wallColor?: string;
  skirting?: string;
  floorByRoomType?: Record<string, string>;
}

interface Layout {
  corridorWidth?: number;
  openKitchen?: boolean;
  minAreaFactor?: number;
}

/** Yangi uslub uchun boshlang'ich qiymatlar — server hammasini talab qiladi. */
const BLANK = {
  roof: { type: 'gable', pitch: 30, overhang: 0.5, material: 'tile', color: '#7A6A5C' },
  facade: { material: 'plaster', primary: '#E9E6E0', accent: '#8A7B6A', plinth: '#6B5B4A' },
  window: { ratio: 1.2, wallAreaRatio: 0.16, frameColor: '#FFFFFF', panoramic: false },
  interior: {
    ceilingHeight: 2.8,
    wallColor: '#F3F1EE',
    skirting: '#FFFFFF',
    floorByRoomType: {},
  },
  layoutRules: { corridorWidth: 1.4, openKitchen: false, minAreaFactor: 1 },
} as const;

const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export function StyleEditor() {
  const t = useTranslations('admin.styles');
  const locale = useLocale();

  const styles = useAdminStyles();
  const roofStyles = useRoofStyles();
  const roomTypes = useRoomTypes();

  const create = useCreateStyle();
  const update = useUpdateStyle();
  const remove = useDeleteStyle();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<StyleDraft>({});
  const [failure, setFailure] = useState<string | null>(null);

  const rows = useMemo(() => styles.data ?? [], [styles.data]);

  /**
   * Tanlov render paytida to'g'rilanadi, effektda emas — effekt bilan
   * o'ng panel bir lahza bo'sh ko'rinardi (`roof-style-editor.tsx`
   * dagi bilan bir xil naqsh).
   */
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0] ?? null;
  if (rows.length > 0 && selectedId !== selected?.id) {
    setSelectedId(selected!.id);
    setDraft({});
  }

  /** Qoralama qo'llangan uslub — ko'rinish va forma shundan o'qiydi. */
  const preview = useMemo<Style | null>(() => {
    if (!selected) return null;

    const merged = { ...selected, ...draft } as Style;

    /*
      Tom preseti almashsa, bog'langan yozuv ham almashishi kerak:
      `roofStyleId` qoralamada, `roofStyle` esa serverdan kelgan
      eski qiymatda qolib ketardi va 3D eski tomni ko'rsatardi.
    */
    if ('roofStyleId' in draft) {
      merged.roofStyle =
        (roofStyles.data ?? []).find((item) => item.id === draft.roofStyleId) ?? null;
    }

    return merged;
  }, [selected, draft, roofStyles.data]);

  const facade = (preview?.facade ?? {}) as Facade;
  const window = (preview?.window ?? {}) as Window;
  const interior = (preview?.interior ?? {}) as Interior;
  const layout = (preview?.layoutRules ?? {}) as Layout;

  const dirty = Object.keys(draft).length > 0;

  const change = (patch: StyleDraft) => {
    setFailure(null);
    setDraft((current) => ({ ...current, ...patch }));
  };

  /** JSON bo'lagining bitta maydonini o'zgartiradi, qolganini saqlaydi. */
  const patchFacade = (patch: Facade) => change({ facade: { ...facade, ...patch } });
  const patchWindow = (patch: Window) => change({ window: { ...window, ...patch } });
  const patchInterior = (patch: Interior) => change({ interior: { ...interior, ...patch } });
  const patchLayout = (patch: Layout) => change({ layoutRules: { ...layout, ...patch } });

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
        slug: `uslub-${suffix}`,
        name: { uz: t('newName') },
        ...BLANK,
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

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* --- Ro'yxat -------------------------------------------------- */}
      <div className="flex min-w-0 flex-col gap-2">
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
                <span className="truncate">{translated(row.name, locale) || row.slug}</span>
                {row.status && row.status !== 'PUBLISHED' ? (
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {t(`statuses.${row.status}` as never)}
                  </span>
                ) : null}
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-5">
            {failure ? (
              <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {failure}
              </p>
            ) : null}

            <Group title={t('basics')}>
              <Field label={t('name')}>
                <Input
                  value={preview.name?.uz ?? ''}
                  onChange={(event) =>
                    change({ name: { ...preview.name, uz: event.target.value } })
                  }
                />
              </Field>

              <Field label={t('slug')} hint={t('slugHint')}>
                <Input
                  value={preview.slug}
                  onChange={(event) => change({ slug: event.target.value })}
                />
              </Field>

              <Field label={t('status')}>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((status) => (
                    <Choice
                      key={status}
                      active={(preview.status ?? 'DRAFT') === status}
                      onClick={() => change({ status })}
                    >
                      {t(`statuses.${status}` as never)}
                    </Choice>
                  ))}
                </div>
              </Field>

              <ImageUpload
                folder="style-preview"
                label={t('previewImage')}
                hint={t('previewImageHint')}
                value={preview.previewUrl}
                onChange={(previewUrl) => change({ previewUrl })}
              />
            </Group>

            <Group title={t('roof')}>
              {/*
                Tom preseti JSON'dan USTUN turadi (`toStyleConfig`).
                Shuning uchun bu yerda faqat preset tanlanadi: JSON'ni
                ham tahrirlash mumkin qilinsa, admin uni o'zgartirib
                hech nima bo'lmaganini ko'rardi.
              */}
              <Field label={t('roofPreset')} hint={t('roofPresetHint')}>
                <div className="flex flex-wrap gap-1.5">
                  <Choice
                    active={!preview.roofStyleId}
                    onClick={() => change({ roofStyleId: null })}
                  >
                    {t('roofFromJson')}
                  </Choice>

                  {(roofStyles.data ?? []).map((item) => (
                    <Choice
                      key={item.id}
                      active={preview.roofStyleId === item.id}
                      onClick={() => change({ roofStyleId: item.id })}
                    >
                      {translated(item.name, locale) || item.code}
                    </Choice>
                  ))}
                </div>
              </Field>
            </Group>

            <Group title={t('facade')}>
              <Colors
                items={[
                  { label: t('facadePrimary'), value: facade.primary ?? '#E9E6E0', onChange: (primary) => patchFacade({ primary }) },
                  { label: t('facadeAccent'), value: facade.accent ?? '#8A7B6A', onChange: (accent) => patchFacade({ accent }) },
                  { label: t('facadePlinth'), value: facade.plinth ?? '#6B5B4A', onChange: (plinth) => patchFacade({ plinth }) },
                ]}
              />
            </Group>

            <Group title={t('window')}>
              <Colors
                items={[
                  { label: t('windowFrame'), value: window.frameColor ?? '#FFFFFF', onChange: (frameColor) => patchWindow({ frameColor }) },
                ]}
              />

              <Slider
                label={t('windowRatio')}
                hint={t('windowRatioHint')}
                value={window.ratio ?? 1.2}
                min={0.3}
                max={4}
                step={0.1}
                onChange={(ratio) => patchWindow({ ratio })}
              />

              <Slider
                label={t('windowArea')}
                hint={t('windowAreaHint')}
                value={window.wallAreaRatio ?? 0.16}
                min={0.05}
                max={0.5}
                step={0.01}
                onChange={(wallAreaRatio) => patchWindow({ wallAreaRatio })}
              />

              <Toggle
                label={t('panoramic')}
                checked={window.panoramic ?? false}
                onChange={(panoramic) => patchWindow({ panoramic })}
              />
            </Group>

            <Group title={t('interior')}>
              <Colors
                items={[
                  { label: t('wallColor'), value: interior.wallColor ?? '#F3F1EE', onChange: (wallColor) => patchInterior({ wallColor }) },
                  { label: t('skirting'), value: interior.skirting ?? '#FFFFFF', onChange: (skirting) => patchInterior({ skirting }) },
                ]}
              />

              <Slider
                label={t('ceilingHeight')}
                hint={t('ceilingHeightHint')}
                value={interior.ceilingHeight ?? 2.8}
                min={2.2}
                max={4.5}
                step={0.05}
                unit=" m"
                onChange={(ceilingHeight) => patchInterior({ ceilingHeight })}
              />

              {/*
                Pol qoplamasi xona TURIGA bog'lanadi. Qoplama nomlari
                `shared/palette.ts` dan olinadi — u yerda yo'q nom
                yozilsa 3D uni jimgina umumiy polga almashtiradi va
                admin buni hech qachon bilmasdi.
              */}
              <Field label={t('floors')} hint={t('floorsHint')}>
                <div className="flex flex-col gap-2">
                  {(roomTypes.data ?? []).map((type) => {
                    const current = interior.floorByRoomType?.[type.code] ?? '';

                    return (
                      <div key={type.code} className="flex items-center gap-2">
                        <span className="w-28 shrink-0 truncate text-sm">
                          {translated(type.name, locale) || type.code}
                        </span>

                        <select
                          aria-label={translated(type.name, locale) || type.code}
                          value={current}
                          onChange={(event) =>
                            patchInterior({
                              floorByRoomType: {
                                ...interior.floorByRoomType,
                                [type.code]: event.target.value,
                              },
                            })
                          }
                          className="min-w-0 flex-1 rounded-lg border bg-background px-2 py-1.5 text-sm"
                        >
                          <option value="">{t('floorDefault')}</option>
                          {Object.keys(FLOOR_FINISHES).map((finish) => (
                            <option key={finish} value={finish}>
                              {t(`finishes.${finish}` as never)}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </Field>
            </Group>

            <Group title={t('layout')}>
              {/*
                Bu uchtasi generatorga TO'G'RIDAN-TO'G'RI tushadi:
                koridor kengligi rejani qayta bo'ladi, `minAreaFactor`
                esa xonalarning sig'ishini belgilaydi. Admin buni
                bilishi kerak — `RoomTypePreview` dagi bilan bir xil
                ogohlantirish.
              */}
              <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {t('layoutWarning')}
              </p>

              <Slider
                label={t('corridorWidth')}
                value={layout.corridorWidth ?? 1.4}
                min={1}
                max={3}
                step={0.1}
                unit=" m"
                onChange={(corridorWidth) => patchLayout({ corridorWidth })}
              />

              <Slider
                label={t('minAreaFactor')}
                hint={t('minAreaFactorHint')}
                value={layout.minAreaFactor ?? 1}
                min={0.7}
                max={1.5}
                step={0.05}
                onChange={(minAreaFactor) => patchLayout({ minAreaFactor })}
              />

              <Toggle
                label={t('openKitchen')}
                checked={layout.openKitchen ?? false}
                onChange={(openKitchen) => patchLayout({ openKitchen })}
              />
            </Group>

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

          <StylePreview style={preview} className="xl:sticky xl:top-6 xl:self-start" />
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

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

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
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Choice({
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
        'rounded-lg border px-2.5 py-1.5 text-sm transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'hover:border-foreground/30 hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}

/**
 * Rang tanlagichlar qatori.
 *
 * Yonida `#rrggbb` matni ham turadi: uslublar bir-biridan ba'zan bir
 * necha foizga farq qiladi va faqat kvadratchaga qarab ularni ajratib
 * bo'lmaydi.
 */
function Colors({
  items,
}: {
  items: Array<{ label: string; value: string; onChange: (value: string) => void }>;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <Label htmlFor={`color-${item.label}`} className="text-xs">
            {item.label}
          </Label>

          <div className="flex items-center gap-1.5">
            <input
              id={`color-${item.label}`}
              type="color"
              value={item.value}
              onChange={(event) => item.onChange(event.target.value)}
              className="h-9 w-12 cursor-pointer rounded-lg border bg-transparent"
            />
            <span className="font-mono text-xs uppercase text-muted-foreground">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-primary"
      />
      {label}
    </label>
  );
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  unit = '',
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
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
        className="w-full accent-primary"
        onChange={(event) => onChange(Number(event.target.value))}
      />

      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
