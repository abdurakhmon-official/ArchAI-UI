import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ForgotPasswordForm } from '@/components/auth/password-reset';

export async function generateMetadata(props: PageProps<'/[locale]/forgot-password'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'auth.reset' });

  return { title: t('forgotTitle') };
}

export default async function ForgotPasswordPage(props: PageProps<'/[locale]/forgot-password'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'auth.reset' });

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('forgotTitle')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('forgotSubtitle')}</p>
      </header>

      <ForgotPasswordForm />
    </div>
  );
}
