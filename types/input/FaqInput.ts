// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type FaqInput = {
    category?: string;
    question: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    };
    answer: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    };
    sort?: number;
    active?: boolean;
};