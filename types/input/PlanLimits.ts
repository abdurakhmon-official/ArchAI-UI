// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type PlanLimits = {
    projects: number;
    variants: number;
    versions: number;
    pdf: boolean;
    dwg: boolean | "on_request";
    interior: boolean;
    edit: boolean;
    watermark: boolean;
};