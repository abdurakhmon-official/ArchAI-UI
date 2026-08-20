import type { BlogPostDetail, Style } from '@/types/domain';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9100/api').replace(/\/$/, '');

const REVALIDATE = 3600;

async function get<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(API + path, { next: { revalidate: REVALIDATE } });
    if (!response.ok) return null;

    const body = (await response.json()) as { data?: T };
    return body.data ?? null;
  } catch {
    return null;
  }
}

export function getPost(slug: string): Promise<BlogPostDetail | null> {
  return get<BlogPostDetail>(`/blog/${encodeURIComponent(slug)}`);
}

export async function getPostSlugs(): Promise<Array<{ slug: string; updated: string | null }>> {
  const posts = await get<Array<{ slug: string; publishedAt: string | null }>>('/blog?limit=50');
  if (!posts) return [];

  return posts.map((post) => ({ slug: post.slug, updated: post.publishedAt }));
}

export async function getStyleSlugs(): Promise<string[]> {
  const styles = await get<Style[]>('/styles');
  return styles?.map((style) => style.slug) ?? [];
}
