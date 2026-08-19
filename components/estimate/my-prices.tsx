'use client';

import { BookmarkPlus, Loader2, Trash2, Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from '@/hooks/use-auth';
import {
  useDeletePriceProfile,
  usePriceProfiles,
  useSavePriceProfile,
} from '@/hooks/use-price-profiles';
import { errorFrom } from '@/lib/errors';
import type { EstimateSelection } from '@/types/domain';

/**
 * "Mening narxlarim".
 *
 * Materiallar tanlovi loyihaga bog'langan: o'z pudratchisining
 * narxlarini biladigan odam har yangi loyihada ularni qaytadan
 * kiritishi kerak edi.
 */

interface Props {
  /** Joriy tanlov — saqlanadigan qiymat. */
  current: EstimateSelection;
  onApply: (selection: EstimateSelection) => void;
}

export function MyPrices({ current, onApply }: Props) {
  const t = useTranslations('estimate.myPrices');
  const { isAuthenticated } = useSession();

  const profiles = usePriceProfiles(isAuthenticated);
  const save = useSavePriceProfile();
  const remove = useDeletePriceProfile();

  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const [failure, setFailure] = useState<string | null>(null);

  // Mehmon uchun bu bo'lim ko'rsatilmaydi: saqlash uchun hisob kerak.
  if (!isAuthenticated) return null;

  const rows = profiles.data ?? [];
  const hasSelection = Object.keys(current).length > 0;

  const store = async () => {
    setFailure(null);
    try {
      await save.mutateAsync({ name: name.trim() || t('defaultName'), selection: current });
      setNaming(false);
      setName('');
    } catch (error) {
      setFailure(errorFrom(error).message);
    }
  };

  return (
    <section className="flex flex-col gap-2 rounded-xl border border-dashed p-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium">{t('title')}</h3>

        {naming ? (
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            <Input
              autoFocus
              value={name}
              placeholder={t('namePlaceholder')}
              onChange={(event) => setName(event.target.value)}
              className="h-8 min-w-32 flex-1 sm:max-w-56"
            />
            <Button size="sm" onClick={store} disabled={save.isPending}>
              {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t('save')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setNaming(false)}>
              {t('cancel')}
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="ms-auto"
            disabled={!hasSelection}
            title={hasSelection ? undefined : t('nothingToSave')}
            onClick={() => {
              setFailure(null);
              setNaming(true);
            }}
          >
            <BookmarkPlus className="size-4" />
            {t('saveCurrent')}
          </Button>
        )}
      </div>

      {failure ? <p className="text-xs text-destructive">{failure}</p> : null}

      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('empty')}</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {rows.map((profile) => (
            <li key={profile.id} className="flex items-center gap-1 rounded-lg border px-2 py-1">
              <button
                type="button"
                onClick={() => onApply(profile.selection)}
                className="flex items-center gap-1.5 text-sm hover:text-primary"
              >
                <Wand2 className="size-3.5" />
                {profile.name}
              </button>

              <button
                type="button"
                aria-label={t('remove')}
                onClick={() => remove.mutate(profile.id)}
                disabled={remove.isPending}
                className="text-muted-foreground hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">{t('hint')}</p>
    </section>
  );
}
