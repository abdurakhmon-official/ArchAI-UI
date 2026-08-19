'use client';

import { ChevronDown, ChevronUp, Loader2, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAdminFaq,
  useCreateFaq,
  useDeleteFaq,
  useReorderFaq,
  useUpdateFaq,
  type FaqDraft,
} from '@/hooks/use-content-admin';
import { errorFrom } from '@/lib/errors';
import { cn } from '@/lib/utils';
import type { FaqItem } from '@/types/domain';

/**
 * Ko'p so'raladigan savollar.
 *
 * Chapda kategoriya bo'yicha guruhlangan ro'yxat, o'ngda tanlangan
 * savol. Tartib strelkalar bilan o'zgaradi, sudrash bilan emas:
 * sudrash uchun qo'shimcha kutubxona kerak bo'lardi va bu ro'yxat
 * odatda o'nlab elementdan iborat — strelkalar yetadi va ular
 * klaviatura bilan ham ishlaydi.
 *
 * `PUT /faq/reorder` faqat o'zgargan yozuvlarni oladi va serverda
 * hajmi cheklangan (`FaqReorderSchema`, 200 tagacha).
 */

const LOCALES = ['uz', 'ru', 'en'] as const;
type Lang = (typeof LOCALES)[number];

export function FaqEditor() {
  const t = useTranslations('admin.faq');

  const faq = useAdminFaq();
  const create = useCreateFaq();
  const update = useUpdateFaq();
  const remove = useDeleteFaq();
  const reorder = useReorderFaq();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<FaqDraft>({});
  const [lang, setLang] = useState<Lang>('uz');
  const [failure, setFailure] = useState<string | null>(null);

  const groups = useMemo(() => faq.data ?? [], [faq.data]);
  const flat = useMemo(() => groups.flatMap((group) => group.questions), [groups]);

  const selected = flat.find((item) => item.id === selectedId) ?? null;

  /** Qoralama qo'llangan savol. */
  const item = useMemo<FaqItem | null>(() => {
    if (!selected) return null;
    return { ...selected, ...draft } as FaqItem;
  }, [selected, draft]);

  const dirty = Object.keys(draft).length > 0;

  const change = (patch: FaqDraft) => {
    setFailure(null);
    setDraft((current) => ({ ...current, ...patch }));
  };

  const changeText = (field: 'question' | 'answer', value: string) => {
    if (!item) return;
    change({ [field]: { ...item[field], [lang]: value } });
  };

  const select = (id: string) => {
    setSelectedId(id);
    setDraft({});
    setFailure(null);
  };

  const save = async () => {
    if (!item || !dirty) return;
    setFailure(null);

    try {
      await update.mutateAsync({
        id: item.id,
        category: item.category,
        question: item.question,
        answer: item.answer,
        sort: item.sort,
        active: item.active,
      });
      setDraft({});
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  const add = async () => {
    setFailure(null);

    try {
      /*
        Javob bo'sh QOLDIRILMAYDI: server tarjima maydonidan bo'sh
        bo'lmagan o'zbekcha matnni talab qiladi (`TranslatedSchema`),
        ya'ni `{uz: ''}` bilan savol umuman yaratilmasdi.

        Shuning uchun o'rniga to'ldirilishi kerakligini aytadigan matn
        qo'yiladi — savol esa yashirin holda qo'shiladi, ya'ni bu matn
        saytga chiqmaydi.
      */
      const created = await create.mutateAsync({
        category: selected?.category ?? 'general',
        question: { uz: t('newQuestion') },
        answer: { uz: t('newAnswer') },
        // Oxiriga qo'yiladi — yangi savol ro'yxat boshiga chiqib
        // ketmasligi kerak.
        sort: flat.length,
        active: false,
      });

      select(created.id);
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  const drop = async () => {
    if (!item) return;
    setFailure(null);

    try {
      await remove.mutateAsync(item.id);
      setSelectedId(null);
      setDraft({});
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  /**
   * Savolni bir pog'ona yuqoriga yoki pastga suradi.
   *
   * Faqat ikkita yozuv yuboriladi — o'rin almashgani. Butun ro'yxatni
   * qayta raqamlash ham mumkin edi, lekin u har harakatda o'nlab
   * `UPDATE` ochardi.
   */
  const move = async (group: FaqItem[], index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= group.length) return;

    const a = group[index];
    const b = group[target];
    setFailure(null);

    try {
      await reorder.mutateAsync([
        { id: a.id, sort: b.sort },
        { id: b.id, sort: a.sort },
      ]);
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  if (faq.isPending) {
    return <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      {/* --- Ro'yxat -------------------------------------------------- */}
      <div className="flex min-w-0 flex-col gap-4">
        {groups.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            {t('empty')}
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.category} className="flex flex-col gap-1">
              <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.category}
              </h2>

              <ul className="flex flex-col gap-1">
                {group.questions.map((question, index) => (
                  <li key={question.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => select(question.id)}
                      className={cn(
                        'flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors',
                        question.id === selectedId
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted',
                      )}
                    >
                      <span className="truncate">{question.question?.uz || t('untitled')}</span>
                      {!question.active ? (
                        <span className="ms-auto shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          {t('hidden')}
                        </span>
                      ) : null}
                    </button>

                    <div className="flex shrink-0 flex-col">
                      <button
                        type="button"
                        aria-label={t('moveUp')}
                        disabled={index === 0 || reorder.isPending}
                        onClick={() => move(group.questions, index, -1)}
                        className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={t('moveDown')}
                        disabled={index === group.questions.length - 1 || reorder.isPending}
                        onClick={() => move(group.questions, index, 1)}
                        className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronDown className="size-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}

        <Button variant="outline" size="sm" onClick={add} disabled={create.isPending}>
          {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          {t('add')}
        </Button>
      </div>

      {/* --- Tahrir ---------------------------------------------------- */}
      {item ? (
        <div className="flex min-w-0 flex-col gap-5">
          {failure ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {failure}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label>{t('category')}</Label>
              <Input
                value={item.category}
                onChange={(event) => change({ category: event.target.value })}
              />
              <p className="text-xs text-muted-foreground">{t('categoryHint')}</p>
            </div>

            <div className="flex flex-col justify-end gap-1.5 pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.active}
                  onChange={(event) => change({ active: event.target.checked })}
                  className="size-4 accent-primary"
                />
                {t('active')}
              </label>
              <p className="text-xs text-muted-foreground">{t('activeHint')}</p>
            </div>
          </div>

          <div className="flex gap-1 border-b">
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={cn(
                  'relative px-3 py-2 text-sm font-medium transition-colors',
                  lang === code
                    ? 'text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {code.toUpperCase()}
                {!item.answer?.[code]?.trim() ? (
                  <span className="ms-1 inline-block size-1.5 rounded-full bg-amber-500 align-middle" />
                ) : null}
              </button>
            ))}
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <Label>{t('question')}</Label>
            <Input
              value={item.question?.[lang] ?? ''}
              onChange={(event) => changeText('question', event.target.value)}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <Label>{t('answer')}</Label>
            <textarea
              value={item.answer?.[lang] ?? ''}
              rows={10}
              onChange={(event) => changeText('answer', event.target.value)}
              className="w-full min-w-0 rounded-lg border bg-background px-3 py-2 text-sm leading-relaxed"
            />
          </div>

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
      ) : (
        <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
          {t('pick')}
        </p>
      )}
    </div>
  );
}
