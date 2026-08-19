'use client';

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { ButtonLink } from '@/components/ui/button-link';
import { useVerifyEmail } from '@/hooks/use-auth';
import { errorFrom } from '@/lib/errors';

/**
 * Email manzilini tasdiqlash.
 *
 * Sahifa ochilishi bilan o'zi ishlaydi — foydalanuvchi xatdagi
 * havolani bosgan, ya'ni u niyatini allaqachon bildirgan. Yana bir
 * marta "Tasdiqlash" tugmasini bostirish ortiqcha qadam bo'lardi.
 *
 * Kirish talab qilinmaydi: odam xatni telefonda ochib, o'sha
 * brauzerda tizimga kirmagan bo'lishi mumkin.
 */

export function VerifyEmail({ token }: { token: string }) {
  const t = useTranslations('auth.verify');
  const verify = useVerifyEmail();

  /*
    Bir marta yuboriladi.

    React qat'iy rejimda effektni ikki marta chaqiradi, token esa BIR
    MARTA ishlaydi — ikkinchi so'rov "yaroqsiz havola" xatosini olib
    kelardi va foydalanuvchi tasdiqlash ishlamadi deb o'ylardi.
  */
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    verify.mutate(token);
  }, [token, verify]);

  if (verify.isPending || verify.isIdle) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t('checking')}</p>
      </div>
    );
  }

  if (verify.isError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-12 text-center">
        <XCircle className="size-8 text-destructive" />
        <div>
          <p className="font-medium">{t('failedTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {errorFrom(verify.error).message || t('failedBody')}
          </p>
        </div>
        {/*
          Yangi havola kabinetdan so'raladi — bu yerda tugma qo'yish
          uchun foydalanuvchi kim ekanini bilish kerak, u esa
          kirmagan bo'lishi mumkin.
        */}
        <ButtonLink variant="outline" size="sm" href="/kabinet/profil">
          {t('goToProfile')}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-12 text-center">
      <CheckCircle2 className="size-8 text-primary" />
      <div>
        <p className="font-medium">{t('doneTitle')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('doneBody')}</p>
      </div>
      <ButtonLink size="sm" href="/kabinet">
        {t('goToCabinet')}
      </ButtonLink>
    </div>
  );
}
