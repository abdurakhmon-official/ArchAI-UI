// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

import type { TreeNode } from '@/lib/geometry/types';

 export type EstimateInput = {
    geometry: {
        bounds: {
            x: number;
            y: number;
            width: number;
            length: number;
        };
        floors: {
            level: number;
            tree: TreeNode;
        }[];
        styleSlug?: string | undefined;
        extras?: {
            kind: "garage" | "terrace" | "balcony" | "basement" | "sauna" | "pool";
            count?: number | undefined;
        }[];
    };
    finishLevel?: string;
    selection?: {
        [x: string]: {
            optionCode?: string | undefined;
            unitPrice?: number | undefined;
            excluded?: boolean | undefined;
            note?: string | undefined;
        };
    };
    roofType?: "flat" | "shed" | "gable" | "hip";
    roofPitch?: number;
    ceilingHeight?: number;
};