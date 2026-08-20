import type { Translated } from './common';

export interface BlogPost {
  id: string;
  slug: string;
  title: Translated;
  excerpt?: Translated;
  coverUrl: string | null;
  views: number;
  publishedAt: string | null;
  category: { slug: string; name: Translated } | null;
  author: { fullName: string } | null;
}

export interface BlogPostDetail extends BlogPost {
  body: Translated;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  categoryId: string | null;
}

export interface BlogCategory {
  id: string;
  slug: string;
  name: Translated;
  _count?: { posts: number };
}

export interface FaqGroup {
  category: string;
  questions: FaqItem[];
}

export interface AdminBlogPost extends BlogPost {
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: Translated;
  answer: Translated;
  sort: number;
  active: boolean;
}

export type LeadStatus = 'NEW' | 'IN_PROGRESS' | 'CONTACTED' | 'CLOSED' | 'SPAM';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  message: string | null;
  source: string;
  status: LeadStatus;
  adminNote: string | null;
  createdAt: string;
}
