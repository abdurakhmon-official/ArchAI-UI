import api from '@/lib/axios';
import { unwrap } from '@/lib/services/unwrap';
import type { MediaFile, OrphanFile, ProjectExportRow } from '@/types/domain';

export const mediaService = {
  list(query: { page?: number; limit?: number; type?: string; search?: string } = {}) {
    return api
      .get<{
        data: MediaFile[];
        meta: { page: number; limit: number; total: number; pages: number };
      }>('/s3/media', { params: query })
      .then((response) => response.data);
  },

  orphans(days = 7) {
    return api
      .get<{ data: OrphanFile[]; meta?: { count: number; bytes: number } }>('/s3/media/orphans', {
        params: { days },
      })
      .then((response) => response.data);
  },

  purgeOrphans(days = 7) {
    return unwrap<{ removed: number }>(api.delete('/s3/media/orphans', { params: { days } }));
  },

  remove(id: string) {
    return api.delete(`/s3/media/${id}`);
  },
};

export const exportAdminService = {
  list(query: { page?: number; kind?: string; search?: string } = {}) {
    return api
      .get<{
        data: ProjectExportRow[];
        meta: { page: number; limit: number; total: number; pages: number; bytes: number };
      }>('/exports', { params: query })
      .then((response) => response.data);
  },

  remove(id: string) {
    return api.delete(`/exports/${id}`);
  },

  purgeExpired() {
    return unwrap<{ removed: number }>(api.delete('/exports/expired'));
  },
};
