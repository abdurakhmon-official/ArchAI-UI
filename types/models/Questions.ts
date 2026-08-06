// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type Questions = {
    correct_option: "A" | "B" | "C" | "D";
    id: string;
    test_id: string;
    text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    order: number;
    created_at: Date;
    test: any;
    answers: any[];
};