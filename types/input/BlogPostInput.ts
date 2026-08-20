// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type BlogPostInput = {
    slug: string;
    title: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    };
    excerpt?: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    } | undefined;
    body: {
        [x: string]: unknown;
    };
    coverUrl?: (string | undefined) | null;
    categoryId?: (string | undefined) | null;
    status?: unknown;
    publishedAt?: (Date | undefined) | null;
};