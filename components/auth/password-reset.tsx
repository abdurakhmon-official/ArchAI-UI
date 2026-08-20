'use client';

import { CheckCircle2, Loader2, MailCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgotPassword, useResetPassword } from '@/hooks/use-auth';
import { Link, useRouter } from '@/i18n/navigation';
import { errorFrom } from '@/lib/errors';

/**
 * Parolni tiklash.
 *
 * Ikki qadam: manzilni kiritish (xat keladi) va yangi parol
 * o'rnatish (xatdagi havola orqali). Ikkalasi bitta faylda, chunki
 * ular bitta oqimning ikki yarmi va matnlari bir-biriga bog'liq.
 *
 * Ilgari bu oqim UMUMAN yo'q edi: parolni unutgan odam hisobidan
 * butunlay ayrilardi.
 */

/** Birinchi qadam — manzilni so'rash. */
export function ForgotPasswordForm() {
  const t = useTranslations('auth.reset');
  const forgot = useForgotPassword();

  const [email, setEmail] = useState('');

  /*
    Yuborilgandan keyin manzil ko'rsatilmaydi va "bunday hisob bor"
    degani ham aytilmaydi. Server ham har doim bir xil javob beradi:
    aks holda bu uch hisob mavjudligini tekshirish asbobiga
    aylanardi.
  */
  if (forgot.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-10 text-center">
        <MailCheck className="size-8 text-primary" />
        <div>
          <p className="font-medium">{t('sentTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('sentBody')}</p>
        </div>
        <ButtonLink variant="outline" size="sm" href="/sign-in">
          {t('backToSignIn')}
        </ButtonLink>
      </div>
    );
  }

  const detail = forgot.error ? errorFrom(forgot.error) : null;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        forgot.mutate({ email });
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {detail?.fields.email ? (
          <p className="text-xs text-destructive">{detail.fields.email}</p>
        ) : null}
      </div>

      {detail && !detail.fields.email ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {detail.message}
        </p>
      ) : null}

      <Button type="submit" disabled={forgot.isPending}>
        {forgot.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {t('send')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/sign-in" className="text-primary hover:underline">
          {t('backToSignIn')}
        </Link>
      </p>
    </form>
  );
}

/** Ikkinchi qadam — xatdagi havola orqali yangi parol. */
export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations('auth.reset');
  const router = useRouter();
  const reset = useResetPassword();

  const [password, setPassword] = useState('');

  if (reset.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-10 text-center">
        <CheckCircle2 className="size-8 text-primary" />
        <div>
          <p className="font-medium">{t('doneTitle')}</p>
          {/*
            Barcha sessiyalar uzilgani ataylab aytiladi: boshqa
            qurilmadan chiqib ketgani foydalanuvchi uchun kutilmagan
            bo'lmasligi kerak.
          */}
          <p className="mt-1 text-sm text-muted-foreground">{t('doneBody')}</p>
        </div>
        <Button size="sm" onClick={() => router.push('/sign-in')}>
          {t('signInNow')}
        </Button>
      </div>
    );
  }

  const detail = reset.error ? errorFrom(reset.error) : null;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        reset.mutate({ token, newPassword: password });
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t('newPassword')}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">{t('passwordHint')}</p>
        {detail?.fields.newPassword ? (
          <p className="text-xs text-destructive">{detail.fields.newPassword}</p>
        ) : null}
      </div>

      {detail && !detail.fields.newPassword ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <p>{detail.message}</p>
          {/*
            Muddati o'tgan yoki ishlatilgan havola eng ko'p uchraydigan
            xato. Foydalanuvchini boshi berk ko'chada qoldirmaslik
            uchun darhol yangisini so'rash yo'li ko'rsatiladi.
          */}
          <Link href="/forgot-password" className="mt-1 inline-block underline">
            {t('requestAgain')}
          </Link>
        </div>
      ) : null}

      <Button type="submit" disabled={reset.isPending}>
        {reset.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {t('save')}
      </Button>
    </form>
  );
}
