'use client';

import { Check, Loader2, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { ReferenceEstimate } from '@/components/admin/reference-estimate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableGroupRow,
  TableHead,
  TableHeader,
  TableRow,
  TableWrap,
} from '@/components/ui/table';
import { useRoomTypes } from '@/hooks/use-catalog';
import {
  useCreateOption,
  useDeleteOption,
  useFinishPresets,
  usePriceImpact,
  usePriceItems,
  useUpdateOption,
  useUpdatePriceItem,
} from '@/hooks/use-prices';
import { errorFrom } from '@/lib/errors';
import { formatDecimal, toNumber, translated } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { AdminPriceItem, AdminPriceOption } from '@/lib/services';

/**
 * Narx bazasi.
 *
 * Ish turlari kategoriya bo'yicha guruhlangan, har birining ostida
 * material variantlari. O'ng tomonda etalon uy — narx o'zgarganda
 * natija SAQLASHDAN OLDIN ko'rinadi.
 *
 * Tahrir "qoralama" holatda yig'iladi va bir tugma bilan yuboriladi:
 * har raqamdan keyin serverga borish adminni sekinlashtiradi va
 * yarim tahrirlangan holatni bazaga yozib qo'yishi mumkin.
 */

export function PriceTable() {
  const t = useTranslations('admin.prices');
  const locale = useLocale();

  const items = usePriceItems();
  const presets = useFinishPresets();
  const impact = usePriceImpact();
  const roomTypes = useRoomTypes();

  const updateItem = useUpdatePriceItem();
  const updateOption = useUpdateOption();

  /** Saqlanmagan narxlar: `itemCode` yoki `itemCode:optionCode` → narx. */
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = Object.keys(draft).length;

  if (items.isPending) {
    return <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />;
  }

  if (items.isError) {
    return (
      <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        {errorFrom(items.error).message}
      </p>
    );
  }

  const rows = items.data ?? [];
  const byCategory = groupByCategory(rows);
  const standard = presets.data?.find((preset) => preset.code === 'standard');

  const setPrice = (key: string, value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return;

    setDraft((current) => ({ ...current, [key]: parsed }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);

    try {
      // Ketma-ket, parallel emas: xato bo'lsa qaysi band buzilganini
      // aniq bilish kerak va audit jurnalida tartib saqlanadi.
      for (const [key, price] of Object.entries(draft)) {
        const [itemCode, optionCode] = key.split(':');
        const item = rows.find((row) => row.code === itemCode);
        if (!item) continue;

        if (optionCode) {
          const option = item.options.find((entry) => entry.code === optionCode);
          if (option) await updateOption.mutateAsync({ optionId: option.id, unit_price: price });
        } else {
          await updateItem.mutateAsync({ id: item.id, unit_price: price });
        }
      }

      setDraft({});
    } catch (problem) {
      setError(errorFrom(problem).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem] xl:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {t('itemCount', { count: rows.length })}
            {impact.data ? ` · ${t('affects', { count: impact.data.projects })}` : ''}
          </p>

          {dirty > 0 ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDraft({})} disabled={saving}>
                <RotateCcw className="size-4" />
                {t('discard')}
              </Button>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {t('save', { count: dirty })}
              </Button>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <TableWrap>
          <Table className="min-w-2xl">
            <TableHeader>
              <TableRow>
                <TableHead>{t('work')}</TableHead>
                <TableHead className="w-28">{t('measure')}</TableHead>
                <TableHead className="w-40 text-end">{t('price')}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {byCategory.map(([category, group]) => (
                <CategoryGroup
                  key={category}
                  title={t(`categories.${category}` as never)}
                  items={group}
                  locale={locale}
                  draft={draft}
                  onPrice={setPrice}
                  presetFor={standard?.defaults ?? {}}
                />
              ))}
            </TableBody>
          </Table>
        </TableWrap>
      </div>

      <ReferenceEstimate
        items={rows}
        draft={draft}
        rules={roomTypes.rules}
        finishDefaults={standard?.defaults}
        className="xl:sticky xl:top-6"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------

interface GroupProps {
  title: string;
  items: AdminPriceItem[];
  locale: string;
  draft: Record<string, number>;
  onPrice: (key: string, value: string) => void;
  presetFor: Record<string, string>;
}

function CategoryGroup({ title, items, locale, draft, onPrice, presetFor }: GroupProps) {
  return (
    <>
      <TableGroupRow colSpan={4}>{title}</TableGroupRow>

      {items.map((item) => (
        <ItemRows
          key={item.id}
          item={item}
          locale={locale}
          draft={draft}
          onPrice={onPrice}
          presetCode={presetFor[item.code]}
        />
      ))}
    </>
  );
}

function ItemRows({
  item,
  locale,
  draft,
  onPrice,
  presetCode,
}: {
  item: AdminPriceItem;
  locale: string;
  draft: Record<string, number>;
  onPrice: (key: string, value: string) => void;
  presetCode?: string;
}) {
  const t = useTranslations('admin.prices');
  const [adding, setAdding] = useState(false);

  return (
    <>
      <TableRow className={cn(!item.active && 'opacity-50')}>
        <TableCell>
          <p className="font-medium">{translated(item.name, locale) || item.code}</p>
          <p className="font-mono text-xs text-muted-foreground">{item.code}</p>
        </TableCell>

        <TableCell>
          <span className="font-mono text-xs text-muted-foreground">{item.measure}</span>
        </TableCell>

        <TableCell>
          <PriceField
            value={draft[item.code] ?? toNumber(item.unit_price)}
            changed={draft[item.code] !== undefined}
            unit={item.unit}
            /**
             * Bazaviy narx faqat material tanlanmaganda ishlatiladi.
             * Pardoz to'plami material belgilagan bo'lsa, bu raqamni
             * o'zgartirish summaga ta'sir qilmaydi — buni aytmasak,
             * admin nima uchun hech narsa o'zgarmayotganini tushunmaydi.
             */
            overridden={Boolean(presetCode)}
            onChange={(value) => onPrice(item.code, value)}
          />
        </TableCell>

        <TableCell>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setAdding((value) => !value)}
            aria-label={t('addOption')}
          >
            <Plus className="size-4" />
          </Button>
        </TableCell>
      </TableRow>

      {item.options.map((option) => (
        <OptionRow
          key={option.id}
          item={item}
          option={option}
          locale={locale}
          draft={draft}
          onPrice={onPrice}
          isPreset={option.code === presetCode}
        />
      ))}

      {adding ? <NewOptionRow itemId={item.id} onDone={() => setAdding(false)} /> : null}
    </>
  );
}

function OptionRow({
  item,
  option,
  locale,
  draft,
  onPrice,
  isPreset,
}: {
  item: AdminPriceItem;
  option: AdminPriceOption;
  locale: string;
  draft: Record<string, number>;
  onPrice: (key: string, value: string) => void;
  isPreset: boolean;
}) {
  const t = useTranslations('admin.prices');
  const remove = useDeleteOption();
  const key = `${item.code}:${option.code}`;

  return (
    <TableRow className={cn('bg-muted/10', !option.active && 'opacity-50')}>
      <TableCell className="ps-8">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">└</span>
          <span>{translated(option.name, locale) || option.code}</span>
          {/* Sukutdagi material — pardoz to'plamida tanlangani. */}
          {isPreset ? (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {t('default')}
            </span>
          ) : null}
        </div>
      </TableCell>

      <TableCell />

      <TableCell>
        <PriceField
          value={draft[key] ?? toNumber(option.unit_price)}
          changed={draft[key] !== undefined}
          unit={item.unit}
          onChange={(value) => onPrice(key, value)}
        />
      </TableCell>

      <TableCell>
        <Button
          size="icon-sm"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10"
          disabled={remove.isPending}
          aria-label={t('removeOption')}
          onClick={() => {
            if (window.confirm(t('removeOptionConfirm'))) remove.mutate(option.id);
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function NewOptionRow({ itemId, onDone }: { itemId: string; onDone: () => void }) {
  const t = useTranslations('admin.prices');
  const create = useCreateOption();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const submit = () => {
    const value = Number(price);
    if (!name.trim() || !Number.isFinite(value) || value < 0) return;

    create.mutate(
      {
        itemId,
        // Kod nomdan yasaladi: admin uni alohida o'ylab topishi shart emas.
        code: slugify(name),
        name: { uz: name.trim() },
        unit_price: value,
      },
      { onSuccess: onDone },
    );
  };

  return (
    <TableRow className="bg-primary/5">
      <TableCell className="ps-8" colSpan={2}>
        <Input
          value={name}
          autoFocus
          placeholder={t('optionName')}
          maxLength={60}
          onChange={(event) => setName(event.target.value)}
          className="h-8"
        />
      </TableCell>

      <TableCell>
        <Input
          value={price}
          type="number"
          inputMode="numeric"
          placeholder="0"
          onChange={(event) => setPrice(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit();
            if (event.key === 'Escape') onDone();
          }}
          className="h-8 text-end font-mono tabular-nums"
        />
      </TableCell>

      <TableCell>
        <Button size="icon-sm" onClick={submit} disabled={create.isPending} aria-label={t('add')}>
          {create.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
}

function PriceField({
  value,
  changed,
  unit,
  overridden = false,
  onChange,
}: {
  value: number;
  changed: boolean;
  unit: string;
  /** Bu narx material bilan almashtirilgan — hisobga kirmaydi. */
  overridden?: boolean;
  onChange: (value: string) => void;
}) {
  const t = useTranslations('admin.prices');
  const locale = useLocale();
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        title={overridden ? t('overriddenHint') : undefined}
        className={cn(
          'flex w-full items-baseline justify-end gap-1 rounded px-2 py-1 text-end transition-colors hover:bg-muted',
          changed && 'bg-primary/10 font-medium text-primary',
          overridden && !changed && 'text-muted-foreground line-through decoration-1',
        )}
      >
        <span className="font-mono tabular-nums">{formatDecimal(value, { locale })}</span>
        <span className="text-xs text-muted-foreground">/{unit}</span>
      </button>
    );
  }

  return (
    <Input
      type="number"
      inputMode="numeric"
      defaultValue={value}
      autoFocus
      min={0}
      onBlur={(event) => {
        onChange(event.target.value);
        setEditing(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
        if (event.key === 'Escape') setEditing(false);
      }}
      className="h-8 text-end font-mono tabular-nums"
    />
  );
}

// ---------------------------------------------------------------------------

/** Kategoriya tartibi serverdan keladi — bu yerda faqat guruhlash. */
function groupByCategory(items: AdminPriceItem[]): Array<[string, AdminPriceItem[]]> {
  const groups = new Map<string, AdminPriceItem[]>();

  for (const item of items) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }

  return [...groups.entries()];
}

/** "Tabiiy parket" → `tabiiy_parket`. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['`’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}
