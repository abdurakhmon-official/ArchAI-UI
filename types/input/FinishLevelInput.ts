// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type FinishLevelInput = {
    name?: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    } | undefined;
    defaults: {
        [x: string]: string;
    };
    sort?: number | undefined;
};