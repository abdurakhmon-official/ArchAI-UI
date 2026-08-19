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
    cover_url?: (string | undefined) | null;
    category_id?: (string | undefined) | null;
    status?: unknown;
    published_at?: (Date | undefined) | null;
};