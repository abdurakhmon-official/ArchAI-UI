// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type PlanInput = {
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
    price_uzs: number;
    price_usd: number;
    limits: {
        projects: number;
        variants: number;
        versions: number;
        pdf: boolean;
        dwg: boolean | "on_request";
        interior: boolean;
        edit: boolean;
        watermark: boolean;
    };
    sort?: number;
    active?: boolean;
};