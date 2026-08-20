import api from '@/lib/axios';
import { unwrap } from '@/lib/services/unwrap';
import type {
  AdminProject,
  EstimateSelection,
  ExportRequest,
  GenerateParams,
  GeometryState,
  JobStatus,
  Project,
  ProjectSummary,
  ProjectVersion,
  SharedProject,
} from '@/types/domain';

export const projectService = {
  async list(query: { page?: number; limit?: number; search?: string } = {}) {
    const { data } = await api.get<{
      data: ProjectSummary[];
      meta: { page: number; limit: number; total: number; pages: number };
    }>('/projects', { params: query });

    return data;
  },

  byId(id: string) {
    return unwrap<Project>(api.get(`/projects/${id}`));
  },

  create(input: {
    title: string;
    note?: string | null;
    params: GenerateParams;
    geometry: GeometryState;
    styleSlug?: string | null;
    skeletonId?: string | null;
    finishLevel?: string;
  }) {
    return unwrap<Project>(api.post('/projects', input));
  },

  update(
    id: string,
    input: {
      title?: string;
      note?: string | null;
      geometry?: GeometryState;
      finishLevel?: string;
      selection?: EstimateSelection;
      versionLabel?: string;
    },
  ) {
    return unwrap<Project>(api.patch(`/projects/${id}`, input));
  },

  saveSelection(id: string, selection: EstimateSelection) {
    return unwrap<Project>(api.patch(`/projects/${id}/estimate`, { selection }));
  },

  remove(id: string) {
    return api.delete(`/projects/${id}`);
  },

  restore(id: string) {
    return api.post(`/projects/${id}/restore`);
  },

  versions(id: string) {
    return unwrap<ProjectVersion[]>(api.get(`/projects/${id}/versions`));
  },

  share(id: string) {
    return unwrap<{ token: string }>(api.post(`/projects/${id}/share`));
  },

  unshare(id: string) {
    return api.delete(`/projects/${id}/share`);
  },

  shared(token: string) {
    return unwrap<SharedProject>(api.get(`/projects/shared/${encodeURIComponent(token)}`));
  },

  restoreVersion(id: string, versionId: string) {
    return unwrap<Project>(api.post(`/projects/${id}/versions/${versionId}/restore`));
  },

  recalculate(id: string) {
    return unwrap<Project>(api.post(`/projects/${id}/recalculate`));
  },

  requestPdf(id: string, locale = 'uz') {
    return unwrap<ExportRequest>(api.post(`/projects/${id}/pdf`, {}, { params: { locale } }));
  },

  requestRender(id: string, view: 'exterior' | 'cutaway' | 'interior' = 'exterior') {
    return unwrap<ExportRequest>(api.post(`/projects/${id}/render`, {}, { params: { view } }));
  },
};

export const jobService = {
  status(jobId: string) {
    return unwrap<JobStatus>(api.get(`/jobs/${encodeURIComponent(jobId)}`));
  },
};

export const projectAdminService = {
  list(query: { page?: number; search?: string; deleted?: string } = {}) {
    return api
      .get<{
        data: AdminProject[];
        meta: { page: number; limit: number; total: number; pages: number };
      }>('/projects/all', { params: query })
      .then((response) => response.data);
  },

  remove(id: string) {
    return api.delete(`/projects/${id}`);
  },

  restore(id: string) {
    return api.post(`/projects/${id}/restore`);
  },
};
