'use client';

import { AlertTriangle, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { fitsQuery, rankCandidates, type SkeletonRow } from '@/lib/shared/generate';
import { cn } from '@/lib/utils';
import type { Skeleton } from '@/types/domain';

/**
 * "Bu andoza qaysi so'rovlarga tushadi".
 *
 * Admin uchun asosiy savol: yangi andoza yaratganda u umuman
 * ishlatiladimi? Chegaralar juda tor bo'lsa (masalan 11.5–12.5 m) u
 * hech qachon tanlanmaydi, va buni faqat foydalanuvchi shikoyat
 * qilganda bilish mumkin edi.
 *
 * Panel HAQIQIY tanlash mantiqini chaqiradi (`fitsQuery`,
 * `rankCandidates`) — takrorlangan taxminni emas. Ular
 * `lib/shared/generate.ts` da, ya'ni generator ishlatadigan bir xil kod.
 */

/** Tekshiriladigan o'lchamlar — konstruktorda eng ko'p uchraydiganlari. */
const WIDTHS = [8, 10, 12, 14, 16, 18];
const LENGTHS = [8, 10, 12, 14, 16, 18];
const BEDROOMS = [1, 2, 3, 4, 5];

interface Props {
  skeleton: Skeleton;
  /** Barcha andozalar — raqobat qanchaligini ko'rsatish uchun. */
  all: Skeleton[];
  className?: string;
}

export function SkeletonCoverage({ skeleton, all, className }: Props) {
  const t = useTranslations('admin.skeletons');

  const toRow = (item: Skeleton): SkeletonRow => ({
    id: item.id,
    name: item.name,
    floors: item.floors,
    tree: item.tree,
    tagBedrooms: item.tagBedrooms,
    tagStyles: item.tagStyles,
    minWidth: item.minWidth,
    maxWidth: item.maxWidth,
    minLength: item.minLength,
    maxLength: item.maxLength,
  });

  /**
   * Tahrirlanayotgan andoza ro'yxatdagi eski nusxasining O'RNIGA qo'yiladi.
   *
   * Busiz panel serverdagi saqlangan qiymatlarni ko'rsatardi: admin
   * oraliqni toraytirsa raqamlar o'zgarardi, to'r esa o'zgarmasdi — ya'ni
   * u aynan tekshirmoqchi bo'lgan narsani ko'rsatmasdi.
   */
  const rows = useMemo<SkeletonRow[]>(
    () => all.map((item) => toRow(item.id === skeleton.id ? skeleton : item)),
    [all, skeleton],
  );

  const grid = useMemo(() => {
    const self = rows.find((row) => row.id === skeleton.id);
    if (!self) return null;

    /**
     * Har bir o'lcham juftligi uchun: bu andoza mos keladimi va
     * eng yuqori o'ringa chiqadimi.
     *
     * Ikkinchisi muhim: mos kelish yetarli emas — `generateVariants`
     * `fit` bo'yicha saralaydi va faqat birinchi 12 ta juftlik
     * hisoblanadi. Har doim ikkinchi o'rinda turgan andoza amalda
     * kamdan kam ishlatiladi.
     */
    return LENGTHS.map((length) =>
      WIDTHS.map((width) => {
        const query = {
          floors: skeleton.floors,
          bedrooms: BEDROOMS[2],
          width,
          length,
        };

        if (!fitsQuery(self, query)) return 'no' as const;

        const ranked = rankCandidates(rows.filter((row) => fitsQuery(row, query)), query);
        return ranked[0]?.id === skeleton.id ? ('first' as const) : ('shared' as const);
      }),
    );
  }, [rows, skeleton]);

  /** Yotoqxona bo'yicha qamrov — teglar to'g'ri qo'yilganini ko'rsatadi. */
  const byBedrooms = useMemo(() => {
    const self = rows.find((row) => row.id === skeleton.id);
    if (!self) return [];

    const width = (skeleton.minWidth + skeleton.maxWidth) / 2;
    const length = (skeleton.minLength + skeleton.maxLength) / 2;

    return BEDROOMS.map((bedrooms) => {
      const query = { floors: skeleton.floors, bedrooms, width, length };
      const ranked = rankCandidates([self], query);
      return { bedrooms, fit: ranked[0]?.fit ?? 0 };
    });
  }, [rows, skeleton]);

  if (!grid) return null;

  const cells = grid.flat();
  const matched = cells.filter((cell) => cell !== 'no').length;
  const firstPlace = cells.filter((cell) => cell === 'first').length;

  return (
    <div className={cn('flex flex-col gap-4 rounded-xl border bg-card p-4', className)}>
      <div>
        <h2 className="text-sm font-medium">{t('coverage')}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{t('coverageHint')}</p>
      </div>

      {matched === 0 ? (
        <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {t('neverUsed')}
        </p>
      ) : firstPlace === 0 ? (
        <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {t('alwaysSecond')}
        </p>
      ) : (
        <p className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
          <Check className="size-3.5 shrink-0" aria-hidden />
          {t('coverageOk', { first: firstPlace, total: cells.length })}
        </p>
      )}

      {/* O'lcham to'ri: satr — uzunlik, ustun — eni. */}
      <div className="overflow-x-auto">
        <table className="text-xs">
          <thead>
            <tr>
              <th className="px-1 py-0.5 text-end font-normal text-muted-foreground">m</th>
              {WIDTHS.map((width) => (
                <th key={width} className="px-1 py-0.5 font-normal text-muted-foreground">
                  {width}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, rowIndex) => (
              <tr key={LENGTHS[rowIndex]}>
                <th className="px-1 py-0.5 text-end font-normal text-muted-foreground">
                  {LENGTHS[rowIndex]}
                </th>
                {row.map((cell, cellIndex) => (
                  <td key={WIDTHS[cellIndex]} className="px-0.5 py-0.5">
                    <span
                      title={`${WIDTHS[cellIndex]} × ${LENGTHS[rowIndex]} m — ${t(`cell.${cell}`)}`}
                      className={cn(
                        'block size-6 rounded',
                        cell === 'first' && 'bg-primary',
                        cell === 'shared' && 'bg-primary/35',
                        cell === 'no' && 'bg-muted',
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <Legend className="bg-primary" label={t('cell.first')} />
        <Legend className="bg-primary/35" label={t('cell.shared')} />
        <Legend className="bg-muted" label={t('cell.no')} />
      </ul>

      {/* Yotoqxona teglari haqiqatan ishlayaptimi. */}
      <div className="flex flex-col gap-1.5 border-t pt-3">
        <p className="text-xs font-medium uppercase text-muted-foreground">{t('byBedrooms')}</p>
        <div className="flex flex-wrap gap-1.5">
          {byBedrooms.map((row) => (
            <span
              key={row.bedrooms}
              className={cn(
                'rounded px-2 py-1 font-mono text-xs tabular-nums',
                row.fit >= 100 ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
              )}
            >
              {row.bedrooms}: {row.fit}
            </span>
          ))}
        </div>
      </div>

      {/*
        Zaxira yo'l haqidagi ogohlantirish.

        Hech qanday andoza mos kelmasa `relaxedCandidates` ishga tushadi
        va u yotoqxona teglarini ham, uslubni ham UMUMAN e'tiborga
        olmaydi: hammaga bir xil `fit: 40` beradi va saralamaydi. Ya'ni
        o'sha holatda tanlovni bazadagi tasodifiy tartib hal qiladi.
        Admin buni bilishi kerak — quyidagi to'r faqat oddiy yo'lni
        ko'rsatadi.
      */}
      <p className="border-t pt-3 text-xs text-muted-foreground">{t('relaxedNote')}</p>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={cn('size-3 rounded', className)} aria-hidden />
      {label}
    </li>
  );
}
