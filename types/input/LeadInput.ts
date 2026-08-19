// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type LeadInput = {
    name: string;
    phone: string;
    message?: string | undefined;
    source?: string;
    payload?: {
        [x: string]: unknown;
    } | undefined;
};