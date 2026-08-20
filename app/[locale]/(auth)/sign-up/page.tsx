import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/auth-form';

export async function generateMetadata(props: PageProps<'/[locale]/sign-up'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return { title: t('signUpTitle') };
}

export default async function SignUpPage(props: PageProps<'/[locale]/sign-up'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('signUpTitle')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('signUpSubtitle')}</p>
      </header>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted/40" />}>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
