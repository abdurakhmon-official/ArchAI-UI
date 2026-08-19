'use client';

import { RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';

/**
 * Kutilmagan xato chegarasi.
 *
 * Ilgari umuman yo'q edi: komponentdagi har qanday tashlangan xato
 * foydalanuvchiga oq ekran berardi va sahifani yangilashdan boshqa yo'l
 * qolmasdi.
 *
 * `reset()` butun daraxtni qayta chizadi — ko'p holatda bu yetadi,
 * chunki xato ko'pincha bir marta keladigan ma'lumotdan kelib chiqadi.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    // Konsolga yozamiz — ishlab chiqarishda `digest` bilan server
    // jurnalidagi yozuvni topish mumkin.
    console.error('sahifa xatosi:', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-24 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t('crashTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('crashText')}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>
          <RotateCcw className="size-4" />
          {t('retry')}
        </Button>
        <ButtonLink href="/" variant="outline">
          {t('home')}
        </ButtonLink>
      </div>

      {/* Qo'llab-quvvatlashga murojaat qilganda shu kod so'raladi. */}
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">{error.digest}</p>
      ) : null}
    </div>
  );
}
