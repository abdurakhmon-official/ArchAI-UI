'use client';

import { AlertTriangle, Calculator, Wand2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePriceBook } from '@/hooks/use-catalog';
import { formatArea, formatSum, formatSumShort } from '@/lib/formatters';
import { suggestFromBudget } from '@/lib/shared/budget';
import type { ConstructorParams } from '@/lib/constructor';

/**
 * Byudjetdan boshlash.
 *
 * Konstruktor o'lchamdan boshlaydi: eni, bo'yi, qavat. Odamning
 * savoli esa ko'pincha teskari — "menda 800 mln bor, nima qura
 * olaman?". Bu blok shu savolga javob beradi va natijani formaga
 * qo'yadi.
 *
 * Hisob TAXMINIY: aniq summa butun uy qurilgandan keyin ma'lum
 * bo'ladi, chunki u devor uzunligi va deraza maydoniga bog'liq.
 */

interface Props {
  params: ConstructorParams;
  onApply: (patch: Partial<ConstructorParams>) => void;
}

export function BudgetStart({ params, onApply }: Props) {
  const t = useTranslations('constructor.budget');
  const locale = useLocale();

  const prices = usePriceBook(params.finishLevel);

  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState('');

  const amount = Number(budget.replace(/\s/g, ''));

  const suggestion = useMemo(() => {
    if (!prices.book || !Number.isFinite(amount) || amount <= 0) return null;

    return suggestFromBudget({
      budget: amount,
      landAreaSotix: params.landAreaSotix,
      floors: params.floors,
      book: prices.book,
    });
  }, [prices.book, amount, params.landAreaSotix, params.floors]);

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Calculator className="size-4" />
        {t('open')}
      </Button>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-dashed p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium">{t('title')}</h2>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          {t('close')}
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="budget">{t('amount')}</Label>
        <Input
          id="budget"
          inputMode="numeric"
          placeholder="800000000"
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">{t('amountHint')}</p>
      </div>

      {suggestion ? (
        <>
          {suggestion.tooSmall ? (
            <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {t('tooSmall', {
                min: formatSumShort(suggestion.estimated, locale),
              })}
            </p>
          ) : null}

          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Fact label={t('size')} value={`${suggestion.width} × ${suggestion.length} m`} />
            <Fact label={t('area')} value={formatArea(suggestion.buildableArea, locale)} />
            <Fact label={t('rooms')} value={String(suggestion.rooms)} />
            <Fact
              label={t('perSquare')}
              value={formatSum(suggestion.perSquareMetre, "so'm", locale)}
            />
          </dl>

          <Button
            size="sm"
            className="self-start"
            onClick={() => {
              onApply({ width: suggestion.width, length: suggestion.length });
              setOpen(false);
            }}
          >
            <Wand2 className="size-4" />
            {t('apply')}
          </Button>
        </>
      ) : null}

      <p className="text-xs text-muted-foreground">{t('disclaimer')}</p>
    </section>
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
