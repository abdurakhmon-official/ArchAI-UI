'use client';

import { Eye, Loader2, Pencil, Plus, RotateCcw, Save, Search, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Markdown } from '@/components/content/markdown';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAdminPost,
  useAdminPosts,
  useBlogCategories,
  useCreatePost,
  useDeletePost,
  useUpdatePost,
  type PostDraft,
} from '@/hooks/use-content-admin';
import { errorFrom } from '@/lib/errors';
import { formatDate, translated } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/**
 * Blog maqolalari.
 *
 * API 18 ta uch bilan tayyor edi, ekran esa yo'q edi — maqolani faqat
 * to'g'ridan-to'g'ri so'rov yuborib yozish mumkin edi.
 *
 * Muharrir WYSIWYG emas, **markdown maydoni**: kelishilgan qaror.
 * Sabab — WYSIWYG saqlanadigan shaklni (`Json`) o'z tuzilmasiga
 * bog'laydi va uni keyin almashtirish qiyin; markdown esa oddiy matn
 * bo'lib qoladi va ochiq sahifada aynan shu ko'rinishda chiziladi
 * (`components/content/markdown.tsx`).
 *
 * Har til uchun alohida tab: `title`, `excerpt` va `body` uchtasi ham
 * `Json` (`{uz, ru, en}`). Bitta uzun formada uch tilni ko'rsatish
 * ekranni uch baravar uzaytirardi.
 */

const LOCALES = ['uz', 'ru', 'en'] as const;
type Lang = (typeof LOCALES)[number];

const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export function BlogEditor() {
  const t = useTranslations('admin.blog');
  const locale = useLocale();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const list = useAdminPosts({
    page,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  });

  const categories = useBlogCategories();

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const detail = useAdminPost(selectedSlug);

  const create = useCreatePost();
  const update = useUpdatePost();
  const remove = useDeletePost();

  const [draft, setDraft] = useState<Partial<PostDraft>>({});
  const [lang, setLang] = useState<Lang>('uz');
  const [previewing, setPreviewing] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const rows = list.data?.data ?? [];
  const meta = list.data?.meta;

  /**
   * Tahrirlanayotgan maqola — serverdagi yozuv ustiga qoralama.
   *
   * `body` va boshqa `Json` maydonlari yo'q bo'lishi mumkin (eski
   * yozuvlarda `{}` yoki `{type:'doc'}` uchraydi), shuning uchun
   * hamma joyda zaxira qiymat.
   */
  const post = useMemo(() => {
    const source = detail.data;
    if (!source) return null;

    return {
      id: source.id,
      slug: draft.slug ?? source.slug,
      title: draft.title ?? (source.title as Record<string, string>) ?? {},
      excerpt: draft.excerpt ?? (source.excerpt as Record<string, string>) ?? {},
      body: draft.body ?? asTranslated(source.body),
      coverUrl: draft.coverUrl !== undefined ? draft.coverUrl : source.coverUrl,
      categoryId:
        draft.categoryId !== undefined ? draft.categoryId : (source.categoryId ?? null),
      status: (draft.status ?? source.status) as PostDraft['status'],
    };
  }, [detail.data, draft]);

  const dirty = Object.keys(draft).length > 0;

  const change = (patch: Partial<PostDraft>) => {
    setFailure(null);
    setDraft((current) => ({ ...current, ...patch }));
  };

  /** Bitta tildagi qiymatni o'zgartiradi, qolgan tillarni saqlaydi. */
  const changeText = (field: 'title' | 'excerpt' | 'body', value: string) => {
    if (!post) return;
    change({ [field]: { ...post[field], [lang]: value } });
  };

  const select = (slug: string) => {
    setSelectedSlug(slug);
    setDraft({});
    setPreviewing(false);
    setFailure(null);
  };

  const save = async () => {
    if (!post || !dirty) return;
    setFailure(null);

    try {
      const saved = await update.mutateAsync({
        id: post.id,
        slug: post.slug,
        title: post.title,
        /*
          Bo'sh qisqacha umuman yuborilmaydi.

          Server tarjima maydonidan o'zbekcha matnni TALAB qiladi
          (`TranslatedSchema`), lekin `excerpt` ning o'zi ixtiyoriy.
          Bo'sh `{}` yuborilsa 400 qaytadi — ya'ni qisqachasiz maqolani
          saqlab bo'lmasdi.
        */
        ...(post.excerpt?.uz?.trim() ? { excerpt: post.excerpt } : {}),
        body: post.body,
        coverUrl: post.coverUrl,
        categoryId: post.categoryId,
        status: post.status,
      });

      setDraft({});
      // Manzil o'zgargan bo'lishi mumkin — tanlov undan keyin qoladi.
      setSelectedSlug(saved.slug);
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  const add = async () => {
    setFailure(null);

    try {
      const suffix = Date.now().toString(36).slice(-5);
      const created = await create.mutateAsync({
        slug: `maqola-${suffix}`,
        title: { uz: t('newTitle') },
        body: { uz: '' },
        status: 'DRAFT',
      });

      select(created.slug);
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  const drop = async () => {
    if (!post) return;
    setFailure(null);

    try {
      await remove.mutateAsync(post.id);
      setSelectedSlug(null);
      setDraft({});
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      {/* --- Ro'yxat -------------------------------------------------- */}
      <div className="flex min-w-0 flex-col gap-3">
        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            placeholder={t('search')}
            className="ps-8"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Chip active={statusFilter === ''} onClick={() => { setStatusFilter(''); setPage(1); }}>
            {t('allStatuses')}
          </Chip>
          {STATUSES.map((status) => (
            <Chip
              key={status}
              active={statusFilter === status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
            >
              {t(`statuses.${status}` as never)}
            </Chip>
          ))}
        </div>

        {list.isPending ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted/30" />
        ) : rows.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            {t('noPosts')}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => select(row.slug)}
                  className={cn(
                    'flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-start transition-colors',
                    row.slug === selectedSlug ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                  )}
                >
                  <span className="truncate text-sm">
                    {translated(row.title, locale) || row.slug}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {t(`statuses.${row.status}` as never)}
                    <span>·</span>
                    {formatDate(row.publishedAt ?? row.createdAt, locale)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {meta && meta.pages > 1 ? (
          <div className="flex items-center justify-between gap-2 text-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              {t('prev')}
            </Button>
            <span className="text-muted-foreground tabular-nums">
              {meta.page} / {meta.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.pages}
              onClick={() => setPage((value) => value + 1)}
            >
              {t('next')}
            </Button>
          </div>
        ) : null}

        <Button variant="outline" size="sm" onClick={add} disabled={create.isPending}>
          {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          {t('add')}
        </Button>
      </div>

      {/* --- Muharrir -------------------------------------------------- */}
      {!selectedSlug ? (
        <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
          {t('pickPost')}
        </p>
      ) : detail.isPending ? (
        <div className="h-96 animate-pulse rounded-xl border bg-muted/30" />
      ) : post ? (
        <div className="flex min-w-0 flex-col gap-5">
          {failure ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {failure}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('slug')} hint={t('slugHint')}>
              <Input value={post.slug} onChange={(event) => change({ slug: event.target.value })} />
            </Field>

            <Field label={t('category')}>
              <select
                aria-label={t('category')}
                value={post.categoryId ?? ''}
                onChange={(event) => change({ categoryId: event.target.value || null })}
                className="h-9 w-full min-w-0 rounded-lg border bg-background px-2 text-sm"
              >
                <option value="">{t('noCategory')}</option>
                {(categories.data ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {translated(item.name, locale) || item.slug}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t('status')}>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((status) => (
                  <Chip
                    key={status}
                    active={post.status === status}
                    onClick={() => change({ status })}
                  >
                    {t(`statuses.${status}` as never)}
                  </Chip>
                ))}
              </div>
            </Field>

            <ImageUpload
              folder="blog"
              label={t('cover')}
              hint={t('coverHint')}
              value={post.coverUrl}
              onChange={(coverUrl) => change({ coverUrl })}
            />
          </div>

          {/* --- Til tablari ------------------------------------------- */}
          <div className="flex items-center justify-between gap-2 border-b">
            <div className="flex gap-1">
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
                  {/*
                    Bo'sh til nuqta bilan belgilanadi: uch tab orasida
                    qaysi biri to'ldirilmaganini boshqacha bilib
                    bo'lmasdi.
                  */}
                  {!post.body?.[code]?.trim() ? (
                    <span className="ms-1 inline-block size-1.5 rounded-full bg-amber-500 align-middle" />
                  ) : null}
                </button>
              ))}
            </div>

            <Button variant="ghost" size="sm" onClick={() => setPreviewing((value) => !value)}>
              {previewing ? <Pencil className="size-4" /> : <Eye className="size-4" />}
              {previewing ? t('edit') : t('preview')}
            </Button>
          </div>

          <Field label={t('title')}>
            <Input
              value={post.title?.[lang] ?? ''}
              onChange={(event) => changeText('title', event.target.value)}
            />
          </Field>

          <Field label={t('excerpt')} hint={t('excerptHint')}>
            <textarea
              value={post.excerpt?.[lang] ?? ''}
              rows={2}
              onChange={(event) => changeText('excerpt', event.target.value)}
              className="w-full min-w-0 rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <Field label={t('body')} hint={previewing ? undefined : t('bodyHint')}>
            {previewing ? (
              /*
                Ko'rish rejimi ochiq sahifadagi AYNAN o'sha komponentni
                chaqiradi. Alohida ko'rinish yozilsa, admin bir xil
                matnni ikki xil ko'radigan bo'lardi.
              */
              <div className="min-h-64 rounded-lg border bg-card p-4">
                {post.body?.[lang]?.trim() ? (
                  <Markdown>{post.body[lang]}</Markdown>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('emptyBody')}</p>
                )}
              </div>
            ) : (
              <textarea
                value={post.body?.[lang] ?? ''}
                rows={18}
                onChange={(event) => changeText('body', event.target.value)}
                className="w-full min-w-0 rounded-lg border bg-background px-3 py-2 font-mono text-sm leading-relaxed"
              />
            )}
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
      ) : (
        <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
          {t('loadFailed')}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

/**
 * Eski yozuvlarda `body` markdown emas.
 *
 * Bazada `{type:'doc',content:[]}` ko'rinishidagi yozuvlar bor — ular
 * hech qachon ishlatilmagan muharrir shaklidan qolgan. Ularni matn
 * sifatida ko'rsatish `[object Object]` berardi, shuning uchun faqat
 * satr qiymatlar olinadi.
 */
function asTranslated(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      ([, text]) => typeof text === 'string',
    ) as Array<[string, string]>,
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

function Chip({
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
        'rounded-lg border px-2.5 py-1 text-sm transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'hover:border-foreground/30 hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}
