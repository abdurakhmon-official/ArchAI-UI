import api from '@/lib/axios';
import { unwrap } from '@/lib/services/unwrap';

// --- Admin ------------------------------------------------------------------

export interface AdminStats {
  users: number;
  newUsers: number;
  projects: number;
  newProjects: number;
  activeSubscriptions: number;
  openLeads: number;
  /** Prisma `Decimal` — satr bo'lishi mumkin, `toNumber()` shart. */
  revenue30d: string | number;
}

/**
 * Admin uchlari.
 *
 * Hammasi `@Authorized(AdminOnly())` bilan himoyalangan; oddiy
 * foydalanuvchi 403 oladi va `lib/axios.ts` uni toast qiladi.
 */
export const adminService = {
  stats() {
    return unwrap<AdminStats>(api.get('/dashboard/admin'));
  },
};

// --- Admin: jurnal -----------------------------------------------------

export interface AuditEntry {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  diff: Record<string, { from: unknown; to: unknown }> | null;
  created_at: string;
  actor: { id: string; fullName: string; email: string } | null;
}

export const auditService = {
  async list(query: { page?: number; entity?: string; action?: string } = {}) {
    const { data } = await api.get<{
      data: AuditEntry[];
      meta: { page: number; limit: number; total: number; pages: number };
    }>('/audit', { params: query });

    return data;
  },

  facets() {
    return unwrap<{ entities: string[]; actions: string[] }>(api.get('/audit/facets'));
  },
};

// --- Admin: foydalanuvchilar -----------------------------------------------

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: 'ADMIN' | 'ARCHITECT' | 'USER';
  active: boolean;
  email_verified: boolean;
  created_at: string;
}

export const userAdminService = {
  /**
   * DIQQAT: bu uch boshqa o'ram ishlatadi — `{ data: { items, count } }`.
   *
   * Qolgan uchlar `{ data, meta }` beradi. Farq eski koddan qolgan va
   * uni bu yerda tekislaymiz, chunki chaqiruvchi joyda ikki xil shakl
   * bilan ishlash xatoga olib keladi.
   */
  async list(query: { page?: number; search?: string; size?: number } = {}) {
    const { data } = await api.get<{ data: { items: AdminUser[]; count: number } }>(
      '/users/paginated',
      { params: query },
    );

    return { items: data.data.items, total: data.data.count };
  },

  setRole(id: string, role: AdminUser['role']) {
    return unwrap<AdminUser>(api.put(`/users/${id}/role`, { role }));
  },

  remove(id: string) {
    return api.delete(`/users/${id}`);
  },
};
