import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/auth-form';

export async function generateMetadata(props: PageProps<'/[locale]/kirish'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return { title: t('signInTitle') };
}

export default async function SignInPage(props: PageProps<'/[locale]/kirish'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('signInTitle')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('signInSubtitle')}</p>
      </header>

      {/* `useSearchParams` ishlatiladi — brauzerda chiziladi. */}
      <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-muted/40" />}>
        <AuthForm mode="signin" />
      </Suspense>
    </div>
  );
}
