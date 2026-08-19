import { getTranslations, setRequestLocale } from 'next-intl/server';
import { UserTable } from '@/components/admin/user-table';

export async function generateMetadata(props: PageProps<'/[locale]/admin/foydalanuvchilar'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return { title: t('nav.users') };
}

export default async function AdminPage(props: PageProps<'/[locale]/admin/foydalanuvchilar'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('nav.users')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('users.subtitle')}</p>
      </header>

      <UserTable />
    </div>
  );
}
