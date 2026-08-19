import { Brand } from '@/components/layout/brand';

/**
 * Kirish sahifalari uchun sodda tashqi ko'rinish.
 *
 * Umumiy sarlavha va pastki qism yo'q: bu sahifada bitta vazifa bor va
 * navigatsiya undan chalg'itadi.
 *
 * `Brand` ning o'zi bosh sahifaga havola — uni yana `Link` ga o'rash
 * `<a>` ichida `<a>` hosil qiladi va hydration xatosiga olib keladi.
 */
export default function AuthLayout({ children }: LayoutProps<'/[locale]'>) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-12">
      <Brand />

      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
