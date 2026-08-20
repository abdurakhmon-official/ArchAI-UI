import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RoomTypeTable } from '@/components/admin/room-type-table';

export async function generateMetadata(props: PageProps<'/[locale]/admin/room-types'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return { title: t('nav.roomTypes') };
}

export default async function AdminRoomTypesPage(props: PageProps<'/[locale]/admin/room-types'>) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('nav.roomTypes')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('roomTypes.subtitle')}</p>
      </header>

      <RoomTypeTable />
    </div>
  );
}
