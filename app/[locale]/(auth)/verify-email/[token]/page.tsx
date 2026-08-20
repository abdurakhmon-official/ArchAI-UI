import { getTranslations, setRequestLocale } from 'next-intl/server';
import { VerifyEmail } from '@/components/auth/verify-email';

export async function generateMetadata(props: PageProps<'/[locale]/verify-email/[token]'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'auth.verify' });

  return { title: t('title') };
}

export default async function VerifyEmailPage(props: PageProps<'/[locale]/verify-email/[token]'>) {
  const { locale, token } = await props.params;
  setRequestLocale(locale);

  return <VerifyEmail token={token} />;
}
