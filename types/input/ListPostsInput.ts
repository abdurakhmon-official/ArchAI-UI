// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type ListPostsInput = {
    page?: number;
    limit?: number;
    category?: string | undefined;
    search?: string | undefined;
    status?: unknown | undefined;
};