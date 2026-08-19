import { AdminGuard } from '@/components/admin/admin-guard';
import { AdminShell } from '@/components/admin/admin-shell';

/**
 * Admin bo'limi.
 *
 * `proxy.ts` allaqachon tokendagi rolni tekshiradi, lekin u imzoni
 * tekshirmaydi — shuning uchun bu yerda `AdminGuard` haqiqiy rolni
 * `/auth/me` dan qayta so'raydi. Ikki qatlam ataylab.
 */
export default function AdminLayout({ children }: LayoutProps<'/[locale]'>) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
