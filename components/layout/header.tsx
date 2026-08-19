'use client';

import { Menu, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Brand } from '@/components/layout/brand';
import { LocaleSwitch } from '@/components/layout/locale-switch';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { UserMenu } from '@/components/layout/user-menu';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Link, usePathname } from '@/i18n/navigation';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';

type StaticPath = '/' | '/konstruktor' | '/uslublar' | '/narxlash' | '/blog' | '/yordam' | '/biz-haqimizda';

const NAV: Array<{ href: StaticPath; key: string }> = [
  { href: '/', key: 'home' },
  { href: '/konstruktor', key: 'constructor' },
  { href: '/uslublar', key: 'styles' },
  { href: '/narxlash', key: 'pricing' },
  { href: '/blog', key: 'blog' },
  { href: '/yordam', key: 'help' },
];

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Brand />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <LocaleSwitch />
          <ThemeToggle />
          <UserMenu />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menyu" />}>
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menyu</SheetTitle>

              <nav className="mt-8 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-accent text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </nav>

              {/*
                Admin bo'limi mobil menyuda ham kerak: `UserMenu`
                dagi ochiluvchi ro'yxat telefonda ham bor, lekin
                admin ko'pincha shu yerdan qidiradi.
              */}
              {user?.isAdmin ? (
                <div className="mt-6 border-t pt-6">
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Shield className="size-4" />
                    {t('adminPanel')}
                  </Link>
                </div>
              ) : null}

              {}
              {!user ? (
                <div className="mt-6 flex flex-col gap-2 border-t pt-6 sm:hidden">
                  <ButtonLink
                    variant="outline"
                    href="/kirish"
                    onClick={() => setOpen(false)}
                    className="w-full"
                  >
                    {t('signIn')}
                  </ButtonLink>
                  <ButtonLink
                    href="/royxatdan-otish"
                    onClick={() => setOpen(false)}
                    className="w-full"
                  >
                    {t('signUp')}
                  </ButtonLink>
                </div>
              ) : null}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
