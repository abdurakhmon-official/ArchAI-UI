// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

import type { TreeNode } from '@/lib/geometry/types';

 export type UpdateProjectInput = {
    title?: string | undefined;
    note?: (string | undefined) | null;
    geometry?: {
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
    } | undefined;
    finishLevel?: string | undefined;
    selection?: {
        [x: string]: {
            optionCode?: string | undefined;
            unitPrice?: number | undefined;
            excluded?: boolean | undefined;
            note?: string | undefined;
        };
    } | undefined;
    versionLabel?: string | undefined;
};