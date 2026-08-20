'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { contentAdminService, contentService } from '@/lib/services';
import type { LeadStatus, Translated } from '@/types/domain';

const useAdminPosts = (query: { page?: number; search?: string; status?: string } = {}) => {
  return useQuery({
    queryKey: [...queryKeys.postsAdmin, query],
    queryFn: () => contentAdminService.posts({ limit: 20, ...query }),
    staleTime: 15_000,
  });
};

const useAdminPost = (slug: string | null) => {
  return useQuery({
    queryKey: [...queryKeys.postsAdmin, 'one', slug],
    queryFn: () => contentAdminService.post(slug!),
    enabled: Boolean(slug),
    staleTime: 0,
  });
};

const useBlogCategories = () => {
  return useQuery({
    queryKey: queryKeys.blogCategories,
    queryFn: contentService.categories,
    staleTime: 5 * 60_000,
  });
};

const useInvalidatePosts = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.postsAdmin });
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };
};

export interface PostDraft {
  slug: string;
  title: Translated;
  excerpt?: Translated;
  body: Translated;
  coverUrl?: string | null;
  categoryId?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

const useCreatePost = () => {
  const invalidate = useInvalidatePosts();

  return useMutation({
    mutationFn: (input: PostDraft) => contentAdminService.createPost(input),
    onSuccess: invalidate,
  });
};

const useUpdatePost = () => {
  const invalidate = useInvalidatePosts();

  return useMutation({
    mutationFn: ({ id, ...input }: PostDraft & { id: string }) =>
      contentAdminService.updatePost(id, input),
    onSuccess: invalidate,
  });
};

const useDeletePost = () => {
  const invalidate = useInvalidatePosts();

  return useMutation({
    mutationFn: (id: string) => contentAdminService.removePost(id),
    onSuccess: invalidate,
  });
};

const useAdminFaq = () => {
  return useQuery({
    queryKey: queryKeys.faqAdmin,
    queryFn: contentService.faq,
    staleTime: 15_000,
  });
};

const useInvalidateFaq = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.faqAdmin });
    queryClient.invalidateQueries({ queryKey: queryKeys.faq });
  };
};

export interface FaqDraft {
  category?: string;
  question?: Translated;
  answer?: Translated;
  sort?: number;
  active?: boolean;
}

const useCreateFaq = () => {
  const invalidate = useInvalidateFaq();

  return useMutation({
    mutationFn: (input: FaqDraft & { question: Translated; answer: Translated }) =>
      contentAdminService.createFaq(input),
    onSuccess: invalidate,
  });
};

const useUpdateFaq = () => {
  const invalidate = useInvalidateFaq();

  return useMutation({
    mutationFn: ({ id, ...input }: FaqDraft & { id: string }) =>
      contentAdminService.updateFaq(id, input),
    onSuccess: invalidate,
  });
};

const useDeleteFaq = () => {
  const invalidate = useInvalidateFaq();

  return useMutation({
    mutationFn: (id: string) => contentAdminService.removeFaq(id),
    onSuccess: invalidate,
  });
};

const useReorderFaq = () => {
  const invalidate = useInvalidateFaq();

  return useMutation({
    mutationFn: (items: Array<{ id: string; sort: number }>) =>
      contentAdminService.reorderFaq(items),
    onSuccess: invalidate,
  });
};

const useLeads = (query: { page?: number; status?: string } = {}) => {
  return useQuery({
    queryKey: [...queryKeys.leads, query],
    queryFn: () => contentAdminService.leads(query),
    staleTime: 10_000,
  });
};

const useInvalidateLeads = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.leads });
};

const useUpdateLead = () => {
  const invalidate = useInvalidateLeads();

  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      status?: LeadStatus;
      adminNote?: string | null;
    }) => contentAdminService.updateLead(id, input),
    onSuccess: invalidate,
  });
};

const useDeleteLead = () => {
  const invalidate = useInvalidateLeads();

  return useMutation({
    mutationFn: (id: string) => contentAdminService.removeLead(id),
    onSuccess: invalidate,
  });
};

export {
  useAdminPosts,
  useAdminPost,
  useBlogCategories,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useAdminFaq,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
  useReorderFaq,
  useLeads,
  useUpdateLead,
  useDeleteLead,
};
