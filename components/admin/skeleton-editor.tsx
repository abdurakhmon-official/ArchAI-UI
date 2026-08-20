'use client';

import { Copy, Loader2, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { SkeletonCoverage } from '@/components/admin/skeleton-coverage';
import { Editor } from '@/components/editor/editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRoomTypes, useStyles } from '@/hooks/use-catalog';
import {
  useCreateSkeleton,
  useDeleteSkeleton,
  useDuplicateSkeleton,
  useSkeletons,
  useUpdateSkeleton,
} from '@/hooks/use-skeletons';
import { errorFrom } from '@/lib/errors';
import { translated } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { GeometryState, Skeleton, SkeletonInput } from '@/types/domain';
import type { TreeNode } from '@/lib/geometry/types';

/**
 * Andoza muharriri.
 *
 * Andoza — generatorning boshlang'ich bo'linish daraxti. Uni raqamlar
 * bilan tahrirlab bo'lmaydi, shuning uchun bu yerda mavjud reja
 * tahrirlagichi ishlatiladi: xona qo'shish, o'chirish, turini
 * o'zgartirish, devorni sudrash — hammasi ko'rinadigan tarzda.
 *
 * `Editor` o'zgarishsiz ishlatiladi: u faqat `geometry` qabul qiladi va
 * hech qanday loyiha holatini o'qimaydi.
 *
 * O'ng tomonda qamrov paneli — "bu andoza qaysi so'rovlarga tushadi".
 * Busiz admin andoza yaratib, uning hech qachon tanlanmasligini faqat
 * foydalanuvchi shikoyat qilganda bilardi.
 */

/** Yangi andoza uchun boshlang'ich daraxt — ikki xonali eng sodda holat. */
const STARTER_TREE: TreeNode = {
  kind: 'split',
  id: 'n1',
  axis: 'vertical',
  ratio: 0.55,
  children: [
    { kind: 'leaf', id: 'r1', roomType: 'living' },
    { kind: 'leaf', id: 'r2', roomType: 'bedroom' },
  ],
};

type Draft = Partial<Omit<SkeletonInput, 'tree'>> & { tree?: SkeletonInput['tree'] };

export function SkeletonEditor() {
  const t = useTranslations('admin.skeletons');

  const skeletons = useSkeletons();
  const roomTypes = useRoomTypes();
  const styles = useStyles();

  const create = useCreateSkeleton();
  const update = useUpdateSkeleton();
  const duplicate = useDuplicateSkeleton();
  const remove = useDeleteSkeleton();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [failure, setFailure] = useState<string | null>(null);

  const rows = useMemo(() => skeletons.data ?? [], [skeletons.data]);

  /**
   * Tanlangan andoza.
   *
   * Tanlov bo'lmasa birinchisi olinadi. Lekin tanlov BOR va ro'yxatda
   * hali yo'q bo'lsa (yangi yaratilgan, so'rov qaytmagan) birinchisiga
   * qaytarilmaydi — ilgari shunday edi va yangi andoza yaratilishi
   * bilanoq boshqasiga almashib ketardi.
   */
  const selected = selectedId
    ? (rows.find((row) => row.id === selectedId) ?? null)
    : (rows[0] ?? null);

  if (!selectedId && selected) setSelectedId(selected.id);

  /** Qoralama qo'llangan andoza — qamrov paneli va tahrirlagich shundan. */
  const current = useMemo<Skeleton | null>(
    () => (selected ? ({ ...selected, ...draft } as Skeleton) : null),
    [selected, draft],
  );

  /**
   * Tahrirlagich uchun kontur.
   *
   * Andozada aniq o'lcham yo'q — faqat qo'llab-quvvatlanadigan oraliq.
   * Tahrir uchun o'rtasi olinadi: bu andoza amalda eng ko'p
   * ishlatiladigan o'lchamga yaqin va daraxtdagi nisbatlar o'lchamdan
   * mustaqil, ya'ni tanlov natijaga ta'sir qilmaydi.
   */
  const geometry = useMemo<GeometryState | null>(() => {
    if (!current) return null;

    return {
      bounds: {
        x: 0,
        y: 0,
        width: (current.minWidth + current.maxWidth) / 2,
        length: (current.minLength + current.maxLength) / 2,
      },
      floors: current.tree.floors,
      extras: [],
    };
  }, [current]);

  /**
   * O'zgarish bormi — saqlangan qiymat bilan solishtirib aniqlanadi.
   *
   * "Qoralamada kalit bormi" deb hisoblash yetarli emas edi:
   * saqlagandan keyin `Editor` o'z holatini yana bir marta beradi va
   * qoralamaga daraxtni qaytadan yozadi. Qiymat aslida saqlangani bilan
   * bir xil bo'lsa ham "Saqlash" tugmasi qolib ketardi va admin nima
   * saqlangan-saqlanmaganini bilolmasdi.
   */
  const dirty = Boolean(current && selected && !sameTree(current, selected));

  const change = (patch: Draft) => {
    setFailure(null);
    setDraft((value) => ({ ...value, ...patch }));
  };

  /**
   * Tahrirlagichdan kelgan geometriya.
   *
   * Faqat daraxtlar olinadi — kontur andozaga tegishli emas va uni
   * saqlash "shu o'lchamda ishlaydi" degan yolg'on va'da bo'lardi.
   */
  const onGeometryChange = (next: GeometryState) => {
    const floors = next.floors.map((floor) => ({ level: floor.level, tree: floor.tree }));

    // `Editor` o'zi ochilganda ham bir marta xabar beradi — o'zgarish
    // bo'lmasa qoralama yaratilmasligi kerak.
    if (sameTree(floors, current?.tree.floors)) return;
    change({ tree: { floors } });
  };

  const save = async () => {
    if (!current || !dirty) return;
    setFailure(null);

    try {
      await update.mutateAsync({
        id: current.id,
        name: current.name,
        floors: current.floors,
        tree: current.tree,
        tagBedrooms: current.tagBedrooms,
        tagStyles: current.tagStyles,
        minWidth: current.minWidth,
        maxWidth: current.maxWidth,
        minLength: current.minLength,
        maxLength: current.maxLength,
        status: current.status,
      });
      setDraft({});
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  const add = async () => {
    setFailure(null);

    try {
      const item = await create.mutateAsync({
        name: t('newName'),
        floors: 1,
        tree: { floors: [{ level: 1, tree: STARTER_TREE }] },
        tagBedrooms: [],
        tagStyles: [],
        minWidth: 8,
        maxWidth: 16,
        minLength: 8,
        maxLength: 16,
        status: 'DRAFT',
      });

      setSelectedId(item.id);
      setDraft({});
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  const act = async (run: () => Promise<unknown>) => {
    setFailure(null);
    try {
      await run();
      setDraft({});
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  if (skeletons.isPending) {
    return <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* --- Ro'yxat --------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-2">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => {
              setSelectedId(row.id);
              setDraft({});
            }}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors',
              row.id === selected?.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'hover:border-foreground/30 hover:bg-muted',
            )}
          >
            {row.name}
            <span className="font-mono text-xs text-muted-foreground">
              {row.floors}q · {t(`status.${row.status}` as never)}
            </span>
          </button>
        ))}

        <Button variant="outline" size="sm" onClick={add} disabled={create.isPending}>
          {create.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          {t('add')}
        </Button>
      </div>

      {failure ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {failure}
        </p>
      ) : null}

      {current && geometry ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          {/* `min-w-0`: keng jadval grid ustunini cho'zib yubormasin. */}
          <div className="flex min-w-0 flex-col gap-4">
            {/* --- Xususiyatlar ------------------------------------------ */}
            <div className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2">
              <Field label={t('name')} htmlFor="skeleton-name">
                <Input
                  id="skeleton-name"
                  value={current.name}
                  onChange={(e) => change({ name: e.target.value })}
                />
              </Field>

              <Field label={t('status.label')}>
                <div className="flex gap-1.5">
                  {(['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => change({ status })}
                      className={cn(
                        'rounded-lg border px-2.5 py-1.5 text-sm transition-colors',
                        current.status === status
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'hover:border-foreground/30 hover:bg-muted',
                      )}
                    >
                      {t(`status.${status}` as never)}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={t('widthRange')} hint={t('rangeHint')}>
                <Range
                  min={current.minWidth}
                  max={current.maxWidth}
                  label={t('widthRange')}
                  onChange={(minWidth, maxWidth) => change({ minWidth, maxWidth })}
                />
              </Field>

              <Field label={t('lengthRange')}>
                <Range
                  min={current.minLength}
                  max={current.maxLength}
                  label={t('lengthRange')}
                  onChange={(minLength, maxLength) => change({ minLength, maxLength })}
                />
              </Field>

              <Field label={t('bedrooms')} hint={t('bedroomsHint')}>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((count) => {
                    const on = current.tagBedrooms.includes(count);

                    return (
                      <button
                        key={count}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          change({
                            tagBedrooms: on
                              ? current.tagBedrooms.filter((value: number) => value !== count)
                              : [...current.tagBedrooms, count].sort((a, b) => a - b),
                          })
                        }
                        className={cn(
                          'size-8 rounded-lg border font-mono text-sm transition-colors',
                          on
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'hover:border-foreground/30 hover:bg-muted',
                        )}
                      >
                        {count}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label={t('styles')} hint={t('stylesHint')}>
                <div className="flex flex-wrap gap-1.5">
                  {(styles.data ?? []).map((style) => {
                    const on = current.tagStyles.includes(style.slug);

                    return (
                      <button
                        key={style.slug}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          change({
                            tagStyles: on
                              ? current.tagStyles.filter((value: string) => value !== style.slug)
                              : [...current.tagStyles, style.slug],
                          })
                        }
                        className={cn(
                          'rounded-lg border px-2.5 py-1.5 text-sm transition-colors',
                          on
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'hover:border-foreground/30 hover:bg-muted',
                        )}
                      >
                        {translated(style.name, 'uz') || style.slug}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>

            {/* --- Daraxt ------------------------------------------------ */}
            <Editor
              key={current.id}
              geometry={geometry}
              rules={roomTypes.rules}
              names={roomTypes.names}
              onChange={onGeometryChange}
            />

            <p className="text-xs text-muted-foreground">{t('boundsNote')}</p>

            <div className="flex flex-wrap items-center gap-2">
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
                onClick={() => act(() => duplicate.mutateAsync(current.id))}
                disabled={duplicate.isPending}
              >
                <Copy className="size-4" />
                {t('duplicate')}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="ms-auto text-destructive"
                onClick={() =>
                  act(async () => {
                    await remove.mutateAsync(current.id);
                    setSelectedId(null);
                  })
                }
                disabled={remove.isPending}
              >
                <Trash2 className="size-4" />
                {t('delete')}
              </Button>
            </div>
          </div>

          <SkeletonCoverage
            skeleton={current}
            all={rows}
            className="xl:sticky xl:top-6 xl:self-start"
          />
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

/**
 * Ikki daraxt bir xilmi.
 *
 * `JSON.stringify` ni to'g'ridan-to'g'ri solishtirib bo'lmaydi: server
 * kalitlarni boshqa tartibda qaytaradi (`id, axis, kind, ratio`),
 * brauzerdagi daraxtda esa `kind, id, axis, ratio`. Ma'no bir xil,
 * satrlar esa har xil.
 *
 * Buning oqibati ko'rinmas edi: har saqlashdan keyin `Editor` o'z
 * holatini qaytarardi, taqqoslash "o'zgardi" deb javob berardi va
 * "Saqlash" tugmasi hech qachon yo'qolmasdi — ya'ni admin nima
 * saqlangan-saqlanmaganini bilolmasdi.
 */
function sameTree(left: unknown, right: unknown): boolean {
  return stableJson(left) === stableJson(right);
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value) ?? 'null';
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/**
 * Ikkita raqam — pastki va yuqori chegara.
 *
 * Alohida maydonlar, surgich emas: admin aniq metrni yozadi, va bu
 * yerda "taxminan" degan narsa yo'q — chegara SQL filtriga aynan
 * shunday tushadi.
 */
function Range({
  min,
  max,
  label,
  onChange,
}: {
  min: number;
  max: number;
  label: string;
  onChange: (min: number, max: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={4}
        max={40}
        step={0.5}
        aria-label={`${label} — eng kam`}
        className="w-20 font-mono tabular-nums"
        value={min}
        onChange={(event) => {
          const value = Number(event.target.value);
          if (Number.isFinite(value)) onChange(value, max);
        }}
      />
      <span className="text-muted-foreground">—</span>
      <Input
        type="number"
        min={4}
        max={40}
        step={0.5}
        aria-label={`${label} — eng ko'p`}
        className="w-20 font-mono tabular-nums"
        value={max}
        onChange={(event) => {
          const value = Number(event.target.value);
          if (Number.isFinite(value)) onChange(min, value);
        }}
      />
      <span className="text-xs text-muted-foreground">m</span>
    </div>
  );
}
