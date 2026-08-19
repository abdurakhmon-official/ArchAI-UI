import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

/**
 * Ochiq sahifalar: bosh sahifa, konstruktor, uslublar, blog, yordam.
 * Route guruhi `(public)` URL'ga ta'sir qilmaydi — faqat layout beradi.
 */
export default function PublicLayout({ children }: LayoutProps<'/[locale]'>) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
