'use client';

import { ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { queryKeys } from '@/lib/query-client';
import { contentService } from '@/lib/services';
import { translated } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export function FaqList() {
  const t = useTranslations('common');
  const locale = useLocale();

  const faq = useQuery({
    queryKey: queryKeys.faq,
    queryFn: contentService.faq,
    staleTime: 30 * 60_000,
  });

  const [filter, setFilter] = useState<string | null>(null);

  if (faq.isPending) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="h-14 animate-pulse rounded-xl bg-muted/40" />
        ))}
      </div>
    );
  }

  const groups = faq.data ?? [];
  const shown = filter ? groups.filter((group) => group.category === filter) : groups;

  if (!groups.length) {
    return <p className="text-center text-sm text-muted-foreground">{t('error')}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          <FilterButton active={filter === null} onClick={() => setFilter(null)}>
            {t('all')}
          </FilterButton>
          {groups.map((group) => (
            <FilterButton
              key={group.category}
              active={filter === group.category}
              onClick={() => setFilter(group.category)}
            >
              {group.category}
            </FilterButton>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {shown.flatMap((group) =>
          group.questions.map((item) => (
            <details
              key={item.id}
              className="group rounded-xl border bg-card px-4 py-3 [&[open]]:pb-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">
                {translated(item.question, locale)}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>

              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                {translated(item.answer, locale)}
              </p>
            </details>
          )),
        )}
      </div>
    </div>
  );
}

function FilterButton({
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
        'rounded-lg border px-3 py-1.5 text-sm transition-colors',
        active ? 'border-primary bg-primary/10 font-medium text-primary' : 'hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}
