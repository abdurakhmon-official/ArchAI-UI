import { notFound } from 'next/navigation';

/**
 * Ishlab chiquvchi sahifalari — faqat mahalliy muhitda.
 *
 * `/dev/plan` 2D chizmani serverga bog'lanmasdan tekshirish uchun
 * yozilgan. U ishlab chiqarish yig'ilishiga kirib, ochiq turgan edi:
 * hech qanday zarar yo'q, lekin mahsulot saytida ishlab chiquvchi
 * sahifasi turishi kerak emas.
 *
 * `notFound()` layout darajasida — shu papkadagi hamma sahifa avtomatik
 * himoyalanadi va yangi sahifa qo'shilganda buni takrorlash esdan
 * chiqmaydi.
 *
 * `NODE_ENV` Next tomonidan yig'ilishda almashtiriladi, ya'ni ishlab
 * chiqarish to'plamida bu shart doimiy `true` bo'lib qoladi.
 */
export default function DevLayout({ children }: LayoutProps<'/[locale]/dev'>) {
  if (process.env.NODE_ENV === 'production') notFound();

  return children;
}
