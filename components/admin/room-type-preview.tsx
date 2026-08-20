'use client';

import { AlertTriangle, Check } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import {
  applyRoomProgram,
  buildHouse,
  drawFloor,
  ensureCirculation,
  fitAndRebalance,
  toSvg,
  validateHouse,
} from '@/lib/geometry';
import type { RoomTypeRule, TreeNode } from '@/lib/geometry/types';
import { formatArea, translated } from '@/lib/formatters';
import { useIssueText } from '@/hooks/use-issue-text';
import { cn } from '@/lib/utils';
import type { RoomType } from '@/types/domain';

/**
 * Xona qoidalari o'zgarganda natijani darhol ko'rsatadi.
 *
 * Nima uchun kerak: `minArea` ni 9 dan 14 ga ko'tarish "shunchaki
 * raqam" emas — u skeletga sig'maydigan xonani tug'diradi va generator
 * uni jimgina tashlab yuboradi. Admin buni faqat foydalanuvchi
 * shikoyat qilganda bilardi.
 *
 * Butun quvur brauzerda ishlaydi: `applyRoomProgram` →
 * `ensureCirculation` → `fitAndRebalance` → `buildHouse` →
 * `validateHouse`. Bu `lib/geometry` — serverdagi bilan aynan bir xil
 * kod, `sync:geometry` nusxalaydi.
 */

/** Etalon kontur — o'zgarmas, shunda taqqoslash ma'noli bo'ladi. */
const BOUNDS = { x: 0, y: 0, width: 12, length: 10 };

/**
 * Boshlang'ich skelet: to'rtta xona.
 *
 * `applyRoomProgram` shundan boshlab sukutdagi buyurtmaga keltiradi —
 * ya'ni xona qo'shish va olib tashlash yo'llari ham sinaladi.
 */
const TREE: TreeNode = {
  kind: 'split',
  id: 'n1',
  axis: 'vertical',
  ratio: 0.56,
  children: [
    {
      kind: 'split',
      id: 'n2',
      axis: 'horizontal',
      ratio: 0.6,
      children: [
        { kind: 'leaf', id: 'r1', roomType: 'living' },
        { kind: 'leaf', id: 'r2', roomType: 'kitchen' },
      ],
    },
    {
      kind: 'split',
      id: 'n3',
      axis: 'horizontal',
      ratio: 0.4,
      children: [
        { kind: 'leaf', id: 'r3', roomType: 'bedroom' },
        { kind: 'leaf', id: 'r4', roomType: 'bathroom' },
      ],
    },
  ],
};

type Draft = Record<string, Partial<Record<string, number | boolean>>>;

interface Props {
  types: RoomType[];
  /** Saqlanmagan o'zgarishlar — `{ kod: { maydon: qiymat } }`. */
  draft: Draft;
  className?: string;
}

export function RoomTypePreview({ types, draft, className }: Props) {
  const issueText = useIssueText('geometry');
  const t = useTranslations('admin.roomTypes');
  const locale = useLocale();

  const result = useMemo(() => {
    if (types.length === 0) return null;

    /** Qoralama qo'llangan qoidalar. */
    const rules: Record<string, RoomTypeRule> = {};
    const names: Record<string, string> = {};
    const program: Record<string, number> = {};

    for (const row of types) {
      const changes = draft[row.code] ?? {};
      const pick = <T,>(field: string, fallback: T): T =>
        (changes[field] as T | undefined) ?? fallback;

      rules[row.code] = {
        code: row.code,
        minArea: pick('minArea', row.minArea),
        maxArea: pick('maxArea', row.maxArea),
        idealRatio: row.idealRatio,
        needsExteriorWall: row.needsExteriorWall,
        isWetZone: row.isWetZone,
        accessFrom: row.accessFrom,
      };

      names[row.code] = translated(row.name, locale) || row.code;

      const selectable = pick('selectable', row.selectable);
      const count = pick('defaultCount', row.defaultCount);
      if (selectable && count > 0) program[row.code] = count;
    }

    try {
      const steps = { roomsAdded: 0, roomsRemoved: 0, skipped: [] };
      const [applied] = applyRoomProgram([TREE], BOUNDS, program, { rules }, steps);

      const circulation = ensureCirculation(applied, BOUNDS, { rules });
      const balanced = fitAndRebalance(circulation.tree, BOUNDS, { rules });

      const { house } = buildHouse(
        { bounds: BOUNDS, floors: [{ level: 1, tree: balanced.tree }] },
        { rules },
      );

      return {
        svg: toSvg(drawFloor(house.floors[0], { names, showDimensions: false }), {
          scale: 24,
          showLabels: true,
          label: 'Namuna qavat rejasi',
        }),
        rooms: house.floors[0].rooms,
        issues: validateHouse(house, { rules }).issues,
        program,
        steps,
        names,
        error: null as string | null,
      };
    } catch (error) {
      // Qoidalar shunchalik qattiq bo'lsa hech qanday reja qurilmaydi —
      // bu ham natija va uni ko'rsatish kerak.
      return {
        svg: null,
        rooms: [],
        issues: [],
        program,
        steps: { roomsAdded: 0, roomsRemoved: 0, skipped: [] },
        names,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [types, draft, locale]);

  if (!result) {
    return <div className={cn('h-64 animate-pulse rounded-xl border bg-muted/30', className)} />;
  }

  /** So'ralgan va haqiqatan qurilgan xonalar farqi. */
  const requested = Object.values(result.program).reduce((sum, count) => sum + count, 0);
  const built = result.rooms.filter((room) => room.roomType in result.program).length;
  const missing = requested - built;

  /**
   * Xato darajasidagi tekshiruv topilmalari ham muvaffaqiyatsizlik.
   *
   * Faqat xona soniga qarash yetarli emas edi: `minArea` ni oshirish
   * ko'pincha xonani yo'qotmaydi, balki uni qoidaga sig'maydigan qilib
   * qoldiradi — va yuqoridagi yashil "hammasi joylashdi" yozuvi shu
   * paytda yolg'on gapirardi.
   */
  const errors = result.issues.filter((issue) => issue.severity === 'error');
  const broken = missing > 0 || errors.length > 0 || Boolean(result.error);

  return (
    <div className={cn('flex flex-col gap-4 rounded-xl border bg-card p-4', className)}>
      <div>
        <h2 className="text-sm font-medium">{t('preview')}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{t('previewHint')}</p>
      </div>

      {result.svg ? (
        <div
          className="[&>svg]:h-auto [&>svg]:w-full overflow-hidden rounded-lg border bg-background"
          // Chizma `lib/geometry` da yaratiladi — tashqi kirish yo'q.
          dangerouslySetInnerHTML={{ __html: result.svg }}
        />
      ) : null}

      {result.error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {result.error}
        </p>
      ) : null}

      {/* Eng muhim signal — qoidalar amalda ishlaydimi. */}
      {broken ? (
        <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {missing > 0 ? t('missingRooms', { count: missing }) : t('brokenRules')}
        </p>
      ) : (
        <p className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
          <Check className="size-3.5 shrink-0" aria-hidden />
          {t('allFit', { count: built })}
        </p>
      )}

      <ul className="flex flex-col gap-1.5 border-t pt-3 text-sm">
        {result.rooms.map((room) => (
          <li key={room.id} className="flex items-center justify-between gap-2">
            <span className="truncate text-muted-foreground">
              {result.names[room.roomType] ?? room.roomType}
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums">
              {formatArea(room.area, locale)}
            </span>
          </li>
        ))}
      </ul>

      {result.issues.length > 0 ? (
        <ul className="flex flex-col gap-1 border-t pt-3">
          {/* Xatolar oldinda — ular harakat talab qiladi, ogohlantirishlar yo'q. */}
          {[...errors, ...result.issues.filter((issue) => issue.severity !== 'error')]
            .slice(0, 5)
            .map((issue, index) => (
              <li
                key={`${issue.code}-${index}`}
                className={cn(
                  'text-xs',
                  issue.severity === 'error' ? 'text-destructive' : 'text-muted-foreground',
                )}
              >
                {issueText(issue.code, issue.values)}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}
