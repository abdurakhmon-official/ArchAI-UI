'use client';

import {
  CreditCard,
  Coins,
  DoorOpen,
  FileClock,
  FolderOpen,
  Home,
  Image as ImageIcon,
  Inbox,
  Landmark,
  LayoutDashboard,
  MessageCircleQuestion,
  Newspaper,
  Palette,
  Ruler,
  Triangle,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/**
 * Admin bo'limi qobig'i.
 *
 * Sayt sarlavhasi va pastki qismi ishlatilmaydi: bu ichki asbob va
 * undagi navigatsiya butunlay boshqacha. Chapdagi ustun har doim
 * ko'rinib turadi — admin ekranlar orasida tez-tez o'tadi.
 */

/**
 * `key` ataylab `string` emas: `next-intl` tarjima kalitlarini tip
 * darajasida tekshiradi va `t(\`nav.${string}\`)` hech qanday kalitga
 * mos kelmaydi. Aniq birlashma bilan xato yozilgan kalit shu yerda
 * ushlanadi.
 */
const NAV = [
  { href: '/admin', key: 'dashboard', icon: LayoutDashboard },
  { href: '/admin/prices', key: 'prices', icon: Coins },
  { href: '/admin/room-types', key: 'roomTypes', icon: DoorOpen },
  { href: '/admin/styles', key: 'styles', icon: Palette },
  { href: '/admin/roof-styles', key: 'roofStyles', icon: Triangle },
  { href: '/admin/skeletons', key: 'skeletons', icon: Ruler },
  { href: '/admin/projects', key: 'projects', icon: FolderOpen },
  { href: '/admin/blog', key: 'blog', icon: Newspaper },
  { href: '/admin/faq', key: 'faq', icon: MessageCircleQuestion },
  { href: '/admin/leads', key: 'leads', icon: Inbox },
  { href: '/admin/media', key: 'media', icon: ImageIcon },
  { href: '/admin/plans', key: 'plans', icon: CreditCard },
  { href: '/admin/payout-cards', key: 'payoutCards', icon: Landmark },
  { href: '/admin/users', key: 'users', icon: Users },
  { href: '/admin/audit', key: 'audit', icon: FileClock },
] as const satisfies ReadonlyArray<{ href: string; key: string; icon: React.ElementType }>;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin');
  const pathname = usePathname();

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-60 shrink-0 flex-col border-e bg-card lg:flex">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <span className="text-sm font-semibold">{t('title')}</span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {NAV.map((item) => {
            // `/admin` hamma yo'lning boshi — u faqat aniq mos kelganda faol.
            const active =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Home className="size-4 shrink-0" />
            {t('backToSite')}
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Tor ekranda yon ustun o'rniga gorizontal aylanuvchi qator. */}
        <nav className="flex gap-1 overflow-x-auto border-b bg-card px-3 py-2 lg:hidden">
          {NAV.map((item) => {
            const active =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors',
                  active ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground',
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
