import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ResetPasswordForm } from '@/components/auth/password-reset';

export async function generateMetadata(props: PageProps<'/[locale]/parol-tiklash/[token]'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'auth.reset' });

  return { title: t('resetTitle') };
}

export default async function ResetPasswordPage(props: PageProps<'/[locale]/parol-tiklash/[token]'>) {
  const { locale, token } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'auth.reset' });

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t('resetTitle')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('resetSubtitle')}</p>
      </header>

      <ResetPasswordForm token={token} />
    </div>
  );
}
