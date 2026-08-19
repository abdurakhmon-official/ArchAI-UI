// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type BlogCategoryInput = {
    slug: string;
    name: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    };
    sort?: number;
};