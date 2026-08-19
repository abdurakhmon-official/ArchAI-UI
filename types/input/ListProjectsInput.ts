// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type ListProjectsInput = {
    page?: number;
    limit?: number;
    search?: string | undefined;
    sortBy?: "updated_at" | "created_at" | "title";
    order?: "asc" | "desc";
};