import api from '@/lib/axios';
import { unwrap } from '@/lib/services/unwrap';
import type {
  AdminBlogPost,
  BlogCategory,
  BlogPost,
  BlogPostDetail,
  FaqGroup,
  FaqItem,
  Lead,
  Translated,
} from '@/types/domain';

export const contentService = {
  async posts(query: { page?: number; limit?: number; category?: string } = {}) {
    const { data } = await api.get<{
      data: BlogPost[];
      meta: { page: number; limit: number; total: number; pages: number };
    }>('/blog', { params: query });

    return data;
  },

  post(slug: string) {
    return unwrap<BlogPostDetail>(api.get(`/blog/${slug}`));
  },

  categories() {
    return unwrap<BlogCategory[]>(api.get('/blog/categories'));
  },

  faq() {
    return unwrap<FaqGroup[]>(api.get('/faq'));
  },

  lead(input: { name: string; phone: string; message?: string; source?: string; payload?: unknown }) {
    return api.post('/leads', input);
  },
};

export const contentAdminService = {
  posts(query: { page?: number; limit?: number; search?: string; status?: string } = {}) {
    return api
      .get<{
        data: AdminBlogPost[];
        meta: { page: number; limit: number; total: number; pages: number };
      }>('/blog', { params: query })
      .then((response) => response.data);
  },

  post(slug: string) {
    return unwrap<BlogPostDetail>(api.get(`/blog/${slug}`));
  },

  createPost(input: object) {
    return unwrap<AdminBlogPost>(api.post('/blog', input));
  },

  updatePost(id: string, input: object) {
    return unwrap<AdminBlogPost>(api.put(`/blog/${id}`, input));
  },

  removePost(id: string) {
    return api.delete(`/blog/${id}`);
  },

  createCategory(input: { slug: string; name: Translated }) {
    return unwrap<{ id: string; slug: string; name: Translated }>(api.post('/blog/categories', input));
  },

  removeCategory(id: string) {
    return api.delete(`/blog/categories/${id}`);
  },

  createFaq(input: object) {
    return unwrap<FaqItem>(api.post('/faq', input));
  },

  updateFaq(id: string, input: object) {
    return unwrap<FaqItem>(api.put(`/faq/${id}`, input));
  },

  removeFaq(id: string) {
    return api.delete(`/faq/${id}`);
  },

  reorderFaq(items: Array<{ id: string; sort: number }>) {
    return api.put('/faq/reorder', { items });
  },

  leads(query: { page?: number; status?: string } = {}) {
    return api
      .get<{
        data: Lead[];
        meta: { page: number; limit: number; total: number; pages: number };
      }>('/leads', { params: query })
      .then((response) => response.data);
  },

  updateLead(id: string, input: { status?: string; adminNote?: string | null }) {
    return unwrap<Lead>(api.put(`/leads/${id}`, input));
  },

  removeLead(id: string) {
    return api.delete(`/leads/${id}`);
  },
};
