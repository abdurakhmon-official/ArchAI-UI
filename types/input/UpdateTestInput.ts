// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type UpdateTestInput = {
    name?: string | undefined;
    description?: (string | undefined) | null;
    subject?: (string | undefined) | null;
    duration_minutes?: number | undefined;
    active?: boolean | undefined;
    questions?: {
        text: string;
        option_a: string;
        option_b: string;
        option_c: string;
        option_d: string;
        correct_option: unknown;
    }[] | undefined;
};