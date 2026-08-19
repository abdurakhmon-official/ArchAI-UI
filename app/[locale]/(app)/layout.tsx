import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

/**
 * Kirgan foydalanuvchi bo'limlari. `proxy.ts` bu yo'llarni tokensiz
 * ochishga yo'l qo'ymaydi, shuning uchun bu yerda qayta tekshirilmaydi.
 */
export default function AppLayout({ children }: LayoutProps<'/[locale]'>) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
