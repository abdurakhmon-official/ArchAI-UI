'use client';

import { Check, ChevronDown, Loader2, RotateCcw, Save } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { MyPrices } from '@/components/estimate/my-prices';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDecimal, formatSum, formatSumShort, translated } from '@/lib/formatters';
import {
  estimateFrom,
  type EstimateLine,
  type EstimateResult,
  type EstimateSelection,
  type PriceBook,
  type PriceLine,
} from '@/lib/shared/pricing';
import { cn } from '@/lib/utils';
import { messageFor } from '@/lib/server-messages';


interface Props {
  estimate: EstimateResult;
  book?: PriceBook | null;
  selection?: EstimateSelection | null;
  onSave?: (selection: EstimateSelection) => void;
  saving?: boolean;
  className?: string;
}

export function EstimateTable({ estimate, book, selection, onSave, saving, className }: Props) {
  const t = useTranslations('estimate');
  const currency = useTranslations('common')('sum');
  const locale = useLocale();

  const editable = Boolean(book && onSave);
  const saved = useMemo(() => selection ?? {}, [selection]);

  const [draft, setDraft] = useState<EstimateSelection>(saved);
  const [expanded, setExpanded] = useState(false);
  const [openLine, setOpenLine] = useState<string | null>(null);

  const [syncedSelection, setSyncedSelection] = useState(saved);
  if (syncedSelection !== saved) {
    setSyncedSelection(saved);
    setDraft(saved);
  }

  const full = useMemo(
    () => (book ? estimateFrom(estimate.measurements, book, {}) : estimate),
    [book, estimate],
  );

  const live = useMemo(
    () => (book ? estimateFrom(estimate.measurements, book, draft) : estimate),
    [book, estimate, draft],
  );

  const byCode = useMemo(
    () => new Map(live.lines.map((line) => [line.code, line])),
    [live],
  );

  const lineOf = useMemo(
    () => new Map((book?.lines ?? []).map((line) => [line.code, line])),
    [book],
  );

  const byCategory = useMemo(() => {
    const groups = new Map<string, EstimateLine[]>();
    for (const line of full.lines) {
      const list = groups.get(line.category) ?? [];
      list.push(line);
      groups.set(line.category, list);
    }

    const live_ = new Map(live.categories.map((row) => [row.category, row]));

    return full.categories
      .map((category) => ({
        category: category.category,
        total: live_.get(category.category)?.total ?? 0,
        share: live_.get(category.category)?.share ?? 0,
        lines: groups.get(category.category) ?? [],
      }))
      .filter((category) => category.lines.length > 0);
  }, [full, live]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const change = (code: string, patch: Partial<EstimateSelection[string]> | null) => {
    setDraft((current) => {
      const next = { ...current };

      if (patch === null) {
        delete next[code];
        return next;
      }

      const merged = { ...next[code], ...patch };
      if (Object.values(merged).every((value) => value === undefined)) delete next[code];
      else next[code] = merged;

      return next;
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label={t('total')} value={formatSum(live.total, currency, locale)} strong />
        <Summary
          label={t('perSquareMeter')}
          value={formatSum(live.perSquareMeter, currency, locale)}
        />
        <Summary label={t('contingency')} value={formatSum(live.contingency, currency, locale)} />
      </div>

      {/*
        "Mening narxlarim" faqat tahrirlanadigan holatda: ko'rish
        rejimida qo'llash tugmasi hech nima qilmasdi.
      */}
      {editable ? <MyPrices current={draft} onApply={setDraft} /> : null}

      {editable ? (
        <Confidence
          value={live.confidence}
          dirty={dirty}
          saving={saving}
          onSave={() => onSave!(draft)}
          onReset={() => setDraft(saved)}
        />
      ) : null}

      {}
      <div className="flex flex-col gap-3">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          {byCategory.map((category, index) => (
            <div
              key={category.category}
              className={SHARE_COLORS[index % SHARE_COLORS.length]}
              style={{ width: `${category.share * 100}%` }}
              title={`${t(`categories.${category.category}`)} — ${Math.round(category.share * 100)}%`}
            />
          ))}
        </div>

        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {byCategory.map((category, index) => (
            <li key={category.category} className="flex items-center gap-1.5">
              <span
                className={cn(
                  'size-2.5 shrink-0 rounded-sm',
                  SHARE_COLORS[index % SHARE_COLORS.length],
                )}
                aria-hidden
              />
              <span>{t(`categories.${category.category}`)}</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {formatSumShort(category.total, locale)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? t('hideLines') : t('showLines', { count: full.lines.length })}
        </Button>

        {expanded ? (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-xl text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-start font-medium">{t('work')}</th>
                  <th className="px-3 py-2 text-end font-medium">{t('quantity')}</th>
                  <th className="px-3 py-2 text-end font-medium">{t('unitPrice')}</th>
                  <th className="px-3 py-2 text-end font-medium">{t('lineTotal')}</th>
                </tr>
              </thead>

              <tbody>
                {byCategory.map((category) => (
                  <CategoryRows
                    key={category.category}
                    title={t(`categories.${category.category}`)}
                    lines={category.lines}
                    live={byCode}
                    priceLines={lineOf}
                    editable={editable}
                    draft={draft}
                    openLine={openLine}
                    onToggle={(code) => setOpenLine((current) => (current === code ? null : code))}
                    onChange={change}
                    locale={locale}
                  />
                ))}
              </tbody>

              <tfoot className="border-t bg-muted/40 font-medium">
                <tr>
                  <td className="px-3 py-2" colSpan={3}>
                    {t('subtotal')}
                  </td>
                  <td className="px-3 py-2 text-end font-mono tabular-nums">
                    {formatSum(live.subtotal, currency, locale)}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2" colSpan={3}>
                    {t('contingency')}
                  </td>
                  <td className="px-3 py-2 text-end font-mono tabular-nums">
                    {formatSum(live.contingency, currency, locale)}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-3 py-2.5 text-base" colSpan={3}>
                    {t('total')}
                  </td>
                  <td className="px-3 py-2.5 text-end font-mono text-base tabular-nums">
                    {formatSum(live.total, currency, locale)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">{messageFor(live.disclaimer, undefined) ?? ''}</p>
    </div>
  );
}

const SHARE_COLORS = [
  'bg-primary',
  'bg-primary/80',
  'bg-primary/65',
  'bg-primary/50',
  'bg-primary/38',
  'bg-primary/28',
  'bg-primary/20',
  'bg-primary/12',
];

function Summary({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('font-mono tabular-nums', strong ? 'text-xl font-semibold' : 'text-base')}>
        {value}
      </p>
    </div>
  );
}

function Confidence({
  value,
  dirty,
  saving,
  onSave,
  onReset,
}: {
  value: number;
  dirty: boolean;
  saving?: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  const t = useTranslations('estimate');
  const percent = Math.round(value * 100);
  const level = value >= 1 ? 'exact' : value > 0 ? 'partial' : 'rough';

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border bg-card px-4 py-3">
      <div className="min-w-40 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium">{t(`confidence.${level}`)}</span>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">{percent}%</span>
        </div>

        <div
          className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label={t('confidence.label')}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-300',
              level === 'exact' ? 'bg-primary' : 'bg-primary/60',
            )}
            style={{ width: `${Math.max(percent, 2)}%` }}
          />
        </div>

        <p className="mt-1.5 text-xs text-muted-foreground">{t(`confidence.${level}Hint`)}</p>
      </div>

      {dirty ? (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onReset} disabled={saving}>
            <RotateCcw className="size-4" />
            {t('reset')}
          </Button>

          <Button size="sm" onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {t('saveSelection')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

interface RowsProps {
  title: string;
  lines: EstimateLine[];
  live: Map<string, EstimateLine>;
  priceLines: Map<string, PriceLine>;
  editable: boolean;
  draft: EstimateSelection;
  openLine: string | null;
  onToggle: (code: string) => void;
  onChange: (code: string, patch: Partial<EstimateSelection[string]> | null) => void;
  locale: string;
}

function CategoryRows({
  title,
  lines,
  live,
  priceLines,
  editable,
  draft,
  openLine,
  onToggle,
  onChange,
  locale,
}: RowsProps) {
  const t = useTranslations('estimate');

  return (
    <>
      <tr className="border-b bg-muted/20">
        <td colSpan={4} className="px-3 py-1.5 text-xs font-medium uppercase text-muted-foreground">
          {title}
        </td>
      </tr>

      {lines.map((base) => {
        const current = live.get(base.code);
        const excluded = !current;
        const open = openLine === base.code;
        const priceLine = priceLines.get(base.code);
        const choice = draft[base.code] ?? {};

        return (
          <RowGroup key={base.code}>
            <tr className={cn('border-b last:border-0', excluded && 'opacity-45')}>
              <td className="px-3 py-2">
                {editable ? (
                  <button
                    type="button"
                    onClick={() => onToggle(base.code)}
                    aria-expanded={open}
                    className="flex items-center gap-1.5 text-start hover:text-primary"
                  >
                    <ChevronDown
                      className={cn('size-3.5 shrink-0 transition-transform', open && 'rotate-180')}
                      aria-hidden
                    />
                    <span className={cn(excluded && 'line-through')}>
                      {translated(base.name, locale)}
                    </span>
                    {current?.optionCode ? (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {optionName(priceLine, current.optionCode, locale)}
                      </span>
                    ) : null}
                  </button>
                ) : (
                  translated(base.name, locale)
                )}
              </td>

              <td className="px-3 py-2 text-end font-mono tabular-nums">
                {formatDecimal(base.quantity, { locale, digits: 1 })} {base.unit}
              </td>

              <td className="px-3 py-2 text-end font-mono tabular-nums text-muted-foreground">
                {excluded ? '—' : formatDecimal(current.unitPrice, { locale })}
              </td>

              <td className="px-3 py-2 text-end font-mono tabular-nums">
                {excluded ? t('excludedShort') : formatDecimal(current.total, { locale })}
              </td>
            </tr>

            {open && priceLine ? (
              <tr className="border-b bg-muted/20 last:border-0">
                <td colSpan={4} className="px-3 py-3">
                  <LineEditor
                    line={priceLine}
                    choice={choice}
                    activeOption={current?.optionCode}
                    excluded={excluded}
                    onChange={(patch) => onChange(base.code, patch)}
                    locale={locale}
                  />
                </td>
              </tr>
            ) : null}
          </RowGroup>
        );
      })}
    </>
  );
}

function RowGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function LineEditor({
  line,
  choice,
  activeOption,
  excluded,
  onChange,
  locale,
}: {
  line: PriceLine;
  choice: EstimateSelection[string];
  activeOption?: string;
  excluded: boolean;
  onChange: (patch: Partial<EstimateSelection[string]> | null) => void;
  locale: string;
}) {
  const t = useTranslations('estimate');
  const own = typeof choice.unitPrice === 'number';

  return (
    <div className="flex flex-col gap-3">
      {line.options.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium uppercase text-muted-foreground">{t('material')}</p>

          <div className="flex flex-wrap gap-2">
            {line.options.map((option) => {
              const active = !own && activeOption === option.code;
              const chosen = choice.optionCode === option.code;

              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => onChange({ optionCode: chosen ? undefined : option.code })}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-start text-sm transition-colors',
                    active
                      ? 'border-primary bg-primary/10'
                      : 'hover:border-foreground/30 hover:bg-muted',
                    own && 'opacity-60',
                  )}
                >
                  {active ? <Check className="size-3.5 shrink-0 text-primary" /> : null}
                  <span>{translated(option.name, locale) || option.code}</span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {formatDecimal(option.unitPrice, { locale })}
                  </span>
                </button>
              );
            })}
          </div>

          {}
          <OptionNote line={line} code={activeOption} locale={locale} />
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`price-${line.code}`}
            className="text-xs font-medium uppercase text-muted-foreground"
          >
            {t('ownPrice')}
          </label>

          <div className="flex items-center gap-2">
            <Input
              id={`price-${line.code}`}
              type="number"
              inputMode="numeric"
              min={0}
              className="w-40 font-mono tabular-nums"
              placeholder={String(Math.round(line.unitPrice))}
              value={choice.unitPrice ?? ''}
              onChange={(event) => {
                const raw = event.target.value.trim();
                const value = Number(raw);
                onChange({
                  unitPrice: raw === '' || !Number.isFinite(value) || value < 0 ? undefined : value,
                });
              }}
            />
            <span className="text-xs text-muted-foreground">{t('perUnit', { unit: line.unit })}</span>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={excluded}
            onChange={(event) => onChange({ excluded: event.target.checked || undefined })}
          />
          {t('excluded')}
        </label>

        {Object.keys(choice).length > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            {t('useDefault')}
          </Button>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">{t('ownPriceHint')}</p>
    </div>
  );
}

function OptionNote({
  line,
  code,
  locale,
}: {
  line: PriceLine;
  code?: string;
  locale: string;
}) {
  const note = translated(line.options.find((option) => option.code === code)?.description, locale);
  if (!note) return null;

  return <p className="text-xs text-muted-foreground">{note}</p>;
}

function optionName(line: PriceLine | undefined, code: string, locale: string): string {
  const option = line?.options.find((item) => item.code === code);
  return option ? translated(option.name, locale) || option.code : code;
}
