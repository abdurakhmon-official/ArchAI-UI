import { QueryClient, isServer } from '@tanstack/react-query';
import { isAxiosError } from 'axios';


function make() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,

        retry(failureCount, error) {
          if (isAxiosError(error)) {
            const status = error.response?.status ?? 0;
            if (status >= 400 && status < 500) return false;
          }

          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) return make();

  browserClient ??= make();
  return browserClient;
}

export const queryKeys = {
  me: ['me'] as const,
  adminStats: ['admin', 'stats'] as const,
  priceItems: ['admin', 'price-items'] as const,
  priceImpact: ['admin', 'price-impact'] as const,
  styles: ['styles'] as const,
  roofStyles: ['roof-styles'] as const,
  stylesAll: ['styles', 'all'] as const,
  roofFamilies: ['roof-families'] as const,
  roomTypes: ['room-types'] as const,
  skeletons: ['skeletons', 'published'] as const,
  adminSkeletons: ['admin', 'skeletons'] as const,
  adminPlans: ['admin', 'plans'] as const,
  adminUsers: (query: Record<string, unknown> = {}) => ['admin', 'users', query] as const,
  subscriptionsPage: (page: number) => ['admin', 'subscriptions', page] as const,
  audit: (query: Record<string, unknown> = {}) => ['admin', 'audit', query] as const,
  auditFacets: ['admin', 'audit-facets'] as const,
  selectableRoomTypes: ['room-types', 'selectable'] as const,
  finishLevels: ['finish-levels'] as const,
  catalogPrices: ['price-catalog'] as const,
  plans: ['plans'] as const,
  providers: ['payment-providers'] as const,
  subscription: ['subscription'] as const,
  generate: (params: Record<string, unknown>) => ['generate', params] as const,
  projects: (query: Record<string, unknown> = {}) => ['projects', query] as const,
  project: (id: string) => ['project', id] as const,
  versions: (id: string) => ['project', id, 'versions'] as const,
  job: (id: string) => ['job', id] as const,
  faq: ['faq'] as const,
  posts: (query: Record<string, unknown> = {}) => ['posts', query] as const,
  postsAdmin: ['posts', 'admin'] as const,
  projectsAdmin: ['projects', 'admin'] as const,
  media: ['media'] as const,
  faqAdmin: ['faq', 'admin'] as const,
  blogCategories: ['blog-categories'] as const,
  leads: ['leads'] as const,
};
