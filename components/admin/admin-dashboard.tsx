'use client';

import { Coins, FolderKanban, MessageSquare, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useAdminStats } from '@/hooks/use-admin';
import { formatDecimal, toNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/**
 * Umumiy ko'rsatkichlar.
 *
 * Har kartada joriy son va oxirgi 30 kundagi o'sish — faqat son
 * ko'rsatilsa, u ko'p yoki ozligini bilib bo'lmaydi.
 */

export function AdminDashboard() {
  const t = useTranslations('admin.stats');
  const locale = useLocale();
  const { data, isPending, isError } = useAdminStats();

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="h-28 animate-pulse rounded-xl border bg-muted/30" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        {t('failed')}
      </p>
    );
  }

  const cards = [
    {
      key: 'users',
      icon: Users,
      value: formatDecimal(data.users, { locale }),
      delta: data.newUsers,
    },
    {
      key: 'projects',
      icon: FolderKanban,
      value: formatDecimal(data.projects, { locale }),
      delta: data.newProjects,
    },
    {
      key: 'revenue',
      icon: Coins,
      value: formatDecimal(toNumber(data.revenue30d), { locale }),
      delta: null,
    },
    {
      key: 'leads',
      icon: MessageSquare,
      value: formatDecimal(data.openLeads, { locale }),
      delta: null,
      // Javobsiz murojaat — e'tibor talab qiladigan yagona ko'rsatkich.
      alert: data.openLeads > 0,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className={cn(
            'flex flex-col gap-2 rounded-xl border bg-card p-4',
            card.alert && 'border-primary/40',
          )}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <card.icon className="size-4" />
            <span className="text-xs">{t(card.key)}</span>
          </div>

          <p className="font-mono text-2xl font-semibold tabular-nums">{card.value}</p>

          {card.delta !== null ? (
            <p className="text-xs text-muted-foreground">{t('last30', { count: card.delta })}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{t(`${card.key}Hint`)}</p>
          )}
        </div>
      ))}
    </div>
  );
}
