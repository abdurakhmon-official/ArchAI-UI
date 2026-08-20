'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { projectService } from '@/lib/services';
import type { EstimateSelection, GenerateParams, GeometryState } from '@/types/domain';

const useProjects = (query: { page?: number; search?: string } = {}) => {
  return useQuery({
    queryKey: queryKeys.projects(query),
    queryFn: () => projectService.list(query),
    staleTime: 30_000,
  });
};

const useProject = (id: string | null) => {
  return useQuery({
    queryKey: queryKeys.project(id ?? ''),
    queryFn: () => projectService.byId(id!),
    enabled: Boolean(id),
  });
};

export interface SaveProjectInput {
  title: string;
  note?: string | null;
  params: GenerateParams;
  geometry: GeometryState;
  styleSlug?: string | null;
  skeletonId?: string | null;
  finishLevel?: string;
}

const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveProjectInput) => projectService.create(input),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.setQueryData(queryKeys.project(project.id), project);
    },
  });
};

const useUpdateProject = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      title?: string;
      note?: string | null;
      geometry?: GeometryState;
      finishLevel?: string;
      selection?: EstimateSelection;
      versionLabel?: string;
    }) => projectService.update(id, input),

    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.project(id), project);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.versions(id) });
    },
  });
};

const useSaveSelection = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (selection: EstimateSelection) => projectService.saveSelection(id, selection),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.project(id), project);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
};

const useProjectVersions = (id: string | null) => {
  return useQuery({
    queryKey: queryKeys.versions(id ?? ''),
    queryFn: () => projectService.versions(id!),
    enabled: Boolean(id),
  });
};

const useRestoreVersion = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionId: string) => projectService.restoreVersion(id, versionId),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.project(id), project);
      queryClient.invalidateQueries({ queryKey: queryKeys.versions(id) });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useSaveSelection,
  useDeleteProject,
  useProjectVersions,
  useRestoreVersion,
};
