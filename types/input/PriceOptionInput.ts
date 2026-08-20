// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type PriceOptionInput = {
    code: string;
    name: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    };
    description?: ({
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    } | undefined) | null;
    unitPrice: number;
    imageUrl?: (string | undefined) | null;
    sort?: number;
    active?: boolean;
};