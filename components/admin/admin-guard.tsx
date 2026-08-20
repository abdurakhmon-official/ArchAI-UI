'use client';

import { Loader2, ShieldOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/button-link';
import { useSession } from '@/hooks/use-auth';
import { useHydrated } from '@/hooks/use-hydrated';

/**
 * Admin bo'limining ikkinchi qatlam qo'riqchisi.
 *
 * Nima uchun `proxy.ts` yetarli emas: u tokendagi `role` ni imzosiz
 * o'qiydi, ya'ni qo'lda yasalgan token bilan uni aldash mumkin. API
 * baribir hech narsa bermaydi, lekin foydalanuvchi bo'sh, xatolarga
 * to'la panelni ko'rib turadi. Bu yerda `/auth/me` dan kelgan haqiqiy
 * rol tekshiriladi.
 *
 * `(app)/layout.tsx` ataylab qayta tekshirmaydi — u yerda xavf yo'q,
 * chunki eng yomoni foydalanuvchi o'z ma'lumotini ko'radi. Bu yerda
 * esa boshqacha, shuning uchun naqsh takrorlanmaydi.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin');
  const { user, loading } = useSession();
  const hydrated = useHydrated();

  /**
   * Gidratatsiyagacha har doim kutish holati.
   *
   * `useSession` cookie'ni o'qiydi, cookie esa serverda mavjud emas —
   * ya'ni server "ruxsat yo'q" ni, brauzer esa "yuklanmoqda" ni
   * chizardi va React butun daraxtni qayta qurardi. Bu yerda shoxlanish
   * bor, shuning uchun gidratatsiya darvozasi kerak; `/dashboard` kabi
   * sahifalarda u kerak emas, chunki ular shoxlanmaydi.
   */
  if (!hydrated || loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
        <ShieldOff className="size-10 text-muted-foreground" />
        <div>
          <p className="font-medium">{t('denied')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('deniedHint')}</p>
        </div>
        <ButtonLink variant="outline" size="sm" href="/">
          {t('backToSite')}
        </ButtonLink>
      </div>
    );
  }

  return <>{children}</>;
}
