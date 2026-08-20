'use client';

import { CreditCard, LayoutGrid, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSignOut } from '@/hooks/use-auth';
import { Link, useRouter } from '@/i18n/navigation';
import { useAppSelector } from '@/store/hooks';

export function UserMenu() {
  const t = useTranslations('nav');
  const user = useAppSelector((state) => state.auth.user);
  const clearSession = useSignOut();
  const router = useRouter();

  // Telefonda bu tugmalar sarlavhaga sig'maydi — ular yon menyuga o'tadi
  // (`components/layout/header.tsx`).
  if (!user) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <ButtonLink variant="ghost" size="sm" href="/sign-in">
          {t('signIn')}
        </ButtonLink>
        <ButtonLink size="sm" href="/sign-up">
          {t('signUp')}
        </ButtonLink>
      </div>
    );
  }

  const signOut = () => {
    clearSession();
    router.push('/');
  };

  const initials = user.fullName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full" aria-label={user.fullName} />
        }
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar}
            alt={user.fullName}
            className="size-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/*
          Sarlavha guruh ichida bo'lishi SHART: Base UI'da u
          `Menu.GroupLabel` va guruhsiz ishlatilsa xato tashlaydi —
          menyu umuman ochilmay qoladi.
        */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{user.fullName}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href="/dashboard" className="cursor-pointer" />}>
          <LayoutGrid className="mr-2 size-4" />
          {t('cabinet')}
        </DropdownMenuItem>

        <DropdownMenuItem render={<Link href="/dashboard/profile" className="cursor-pointer" />}>
          <UserIcon className="mr-2 size-4" />
          {t('profile')}
        </DropdownMenuItem>

        {/* Obuna sahifasiga boshqa hech qayerdan yo'l yo'q. */}
        <DropdownMenuItem render={<Link href="/dashboard/subscription" className="cursor-pointer" />}>
          <CreditCard className="mr-2 size-4" />
          {t('subscription')}
        </DropdownMenuItem>

        {/*
          Admin bo'limi — faqat adminga.

          Bu yerdagi tekshiruv qulf emas, qulaylik: haqiqiy himoya
          `proxy.ts` da va API tomonidagi `AdminOnly()` da. Havolani
          ko'rsatmaslik esa oddiy foydalanuvchini kirishi mumkin
          bo'lmagan sahifaga bosishdan saqlaydi.
        */}
        {user.isAdmin ? (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuItem render={<Link href="/admin" className="cursor-pointer" />}>
              <Shield className="mr-2 size-4" />
              {t('adminPanel')}
            </DropdownMenuItem>
          </>
        ) : null}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 size-4" />
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
