import api from '@/lib/axios';
import { unwrap } from '@/lib/services/unwrap';
import type { Translated } from '@/types/domain';

export interface AdminStats {
  users: number;
  newUsers: number;
  projects: number;
  newProjects: number;
  activeSubscriptions: number;
  openLeads: number;
  revenue30d: string | number;
}

export const adminService = {
  stats() {
    return unwrap<AdminStats>(api.get('/dashboard/admin'));
  },
};

export interface AuditEntry {
  id: string;
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  diff: Record<string, { from: unknown; to: unknown }> | null;
  createdAt: string;
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

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: 'ADMIN' | 'ARCHITECT' | 'USER';
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
  currentPlan: { code: string; name: Translated } | null;
}

export const userAdminService = {
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

  setPlan(id: string, planCode: string, password: string) {
    return unwrap<{ planCode: string }>(api.put(`/users/${id}/plan`, { planCode, password }));
  },

  remove(id: string) {
    return api.delete(`/users/${id}`);
  },
};
