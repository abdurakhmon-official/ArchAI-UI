'use client';

import { ArrowRight, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState, useTransition } from 'react';
import { Counter } from '@/components/constructor/counter';
import { Footprint } from '@/components/constructor/footprint';
import { LivePreview } from '@/components/constructor/live-preview';
import { BudgetStart } from '@/components/constructor/budget-start';
import { MeasureField } from '@/components/constructor/measure-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useFinishLevels, useSelectableRoomTypes, useStyles } from '@/hooks/use-catalog';
import { useRouter } from '@/i18n/navigation';
import {
  DEFAULT_PARAMS,
  EXTRA_KINDS,
  NORTH_SIDES,
  toSearchParams,
  validateParams,
  type ConstructorParams,
} from '@/lib/constructor';
import { translated } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { useIssueText } from '@/hooks/use-issue-text';

interface Props {
  initial?: ConstructorParams;
}

export function ConstructorForm({ initial }: Props) {
  const issueText = useIssueText('params');
  const t = useTranslations('constructor');
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [params, setParams] = useState<ConstructorParams>(initial ?? DEFAULT_PARAMS);
  const [touched, setTouched] = useState(false);

  const styles = useStyles();
  const finishLevels = useFinishLevels();
  const roomTypes = useSelectableRoomTypes();

  const [filled, setFilled] = useState(Object.keys(params.rooms).length > 0);

  if (!filled && roomTypes.data) {
    setFilled(true);
    setParams((current) => ({ ...current, rooms: roomTypes.defaults }));
  }

  const issues = useMemo(
    () => validateParams(params, roomTypes.limits),
    [params, roomTypes.limits],
  );
  const blocked = issues.length > 0;

  const patch = (changes: Partial<ConstructorParams>) => {
    setTouched(true);
    setParams((current) => ({ ...current, ...changes }));
  };

  const setRoom = (code: string, value: number) => {
    setTouched(true);
    setParams((current) => ({ ...current, rooms: { ...current.rooms, [code]: value } }));
  };

  const submit = () => {
    setTouched(true);
    if (blocked) return;

    startTransition(() => {
      router.push({
        pathname: '/konstruktor/natijalar',
        query: Object.fromEntries(toSearchParams(params)),
      });
    });
  };

  const showIssues = touched && blocked;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start"
    >
      <div className="flex flex-col gap-6">
        {/*
          Byudjetdan boshlash — ixtiyoriy yo'l. U formani
          almashtirmaydi, faqat o'lchamlarni to'ldiradi.
        */}
        <BudgetStart params={params} onApply={patch} />

        <Card>
          <CardHeader>
            <CardTitle>{t('steps.land')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <MeasureField
              id="land-area"
              label={t('fields.landArea')}
              unit={t('fields.landAreaUnit')}
              value={params.landAreaSotix}
              min={1}
              max={200}
              step={0.5}
              invalid={showIssues && issues.some((issue) => issue.field === 'landAreaSotix')}
              onChange={(landAreaSotix) => patch({ landAreaSotix })}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <MeasureField
                id="width"
                label={t('fields.width')}
                unit={t('fields.meters')}
                value={params.width}
                min={4}
                max={40}
                step={0.5}
                onChange={(width) => patch({ width })}
              />
              <MeasureField
                id="length"
                label={t('fields.length')}
                unit={t('fields.meters')}
                value={params.length}
                min={4}
                max={40}
                step={0.5}
                onChange={(length) => patch({ length })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t('fields.floors')}</Label>
              <ChoiceGroup
                label={t('fields.floors')}
                value={String(params.floors)}
                options={[1, 2, 3].map((level) => ({
                  value: String(level),
                  label: t('floorCount', { count: level }),
                }))}
                onChange={(value) => patch({ floors: Number(value) })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('steps.rooms')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {}
            {roomTypes.isPending ? (
              <RoomSkeleton />
            ) : (
              roomTypes.data?.map((type) => (
                <Counter
                  key={type.code}
                  label={translated(type.name, locale) || type.code}
                  value={params.rooms[type.code] ?? 0}
                  max={type.max_count}
                  onChange={(value) => setRoom(type.code, value)}
                />
              ))
            )}

            <div className="flex flex-col gap-2 pt-4">
              <Label>{t('fields.kitchen')}</Label>
              <ChoiceGroup
                label={t('fields.kitchen')}
                value={params.kitchen}
                options={[
                  { value: 'separate', label: t('fields.kitchenSeparate') },
                  { value: 'combined', label: t('fields.kitchenCombined') },
                ]}
                onChange={(value) =>
                  patch({ kitchen: value === 'combined' ? 'combined' : 'separate' })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('steps.extras')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>{t('fields.garage')}</Label>
              <ChoiceGroup
                label={t('fields.garage')}
                value={String(params.garage)}
                options={[
                  { value: '0', label: t('fields.noGarage') },
                  ...[1, 2, 3].map((count) => ({
                    value: String(count),
                    label: t('fields.garageCars', { count }),
                  })),
                ]}
                onChange={(value) => patch({ garage: Number(value) })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t('fields.extras')}</Label>
              <div className="flex flex-wrap gap-2">
                {EXTRA_KINDS.map((kind) => {
                  const active = params.extras.includes(kind);
                  return (
                    <Button
                      key={kind}
                      type="button"
                      variant={active ? 'secondary' : 'outline'}
                      size="sm"
                      aria-pressed={active}
                      onClick={() =>
                        patch({
                          extras: active
                            ? params.extras.filter((item) => item !== kind)
                            : [...params.extras, kind],
                        })
                      }
                    >
                      {t(`extras.${kind}`)}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('steps.style')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>{t('fields.style')}</Label>
              <ChoiceGroup
                label={t('fields.style')}
                value={params.styleSlug ?? ''}
                options={[
                  { value: '', label: t('fields.anyStyle') },
                  ...(styles.data ?? []).map((style) => ({
                    value: style.slug,
                    label: translated(style.name, locale),
                  })),
                ]}
                onChange={(value) => patch({ styleSlug: value || undefined })}
              />
            </div>

            {/*
              Yo'nalish ixtiyoriy: bilmagan odam "Bilmayman" ni
              tanlaydi va hisob avvalgidek ishlayveradi.
            */}
            <div className="flex flex-col gap-2">
              <Label>{t('fields.north')}</Label>
              <ChoiceGroup
                label={t('fields.north')}
                value={params.northSide ?? ''}
                options={[
                  { value: '', label: t('fields.northUnknown') },
                  ...NORTH_SIDES.map((side) => ({
                    value: side,
                    label: t(`fields.sides.${side}` as never),
                  })),
                ]}
                onChange={(value) =>
                  patch({ northSide: (value || undefined) as ConstructorParams['northSide'] })
                }
              />
              <p className="text-xs text-muted-foreground">{t('fields.northHint')}</p>
            </div>

            <div className="grid gap-5">
              {}
              <div className="flex flex-col gap-2">
                <Label>{t('fields.finish')}</Label>
                <ChoiceGroup
                  label={t('fields.finish')}
                  value={params.finishLevel}
                  options={(finishLevels.data ?? []).map((level) => ({
                    value: level.code,
                    label: translated(level.name, locale),
                  }))}
                  onChange={(finishLevel) => patch({ finishLevel })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('summary.title')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Footprint params={params} />

            {showIssues ? (
              <ul className="flex flex-col gap-1.5">
                {issues.map((issue, index) => (
                  <li key={index} className="text-xs text-destructive">
                    {issueText(issue.code, issue.values)}
                  </li>
                ))}
              </ul>
            ) : null}

            <Button type="submit" size="lg" disabled={pending || (touched && blocked)}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              {t('submit')}
            </Button>

            <p className="text-center text-xs text-muted-foreground">{t('summary.note')}</p>
          </CardContent>
        </Card>

        {}
        {Object.keys(params.rooms).length > 0 ? <LivePreview params={params} /> : null}
      </aside>
    </form>
  );
}

function RoomSkeleton() {
  return (
    <div className="flex flex-col divide-y" aria-hidden>
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="flex items-center justify-between py-3">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  );
}

interface ChoiceProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function ChoiceGroup({ label, value, options, onChange }: ChoiceProps) {
  if (!options.length) {
    return <div className="h-8 w-full animate-pulse rounded-lg bg-muted" aria-hidden />;
  }

  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              active
                ? 'border-primary bg-primary/10 font-medium text-primary'
                : 'border-border hover:bg-muted',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
