// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type ListAllProjectsInput = {
    page?: number;
    limit?: number;
    search?: string | undefined;
    sortBy?: "updatedAt" | "createdAt" | "title";
    order?: "asc" | "desc";
    deleted?: "exclude" | "include" | "only";
};