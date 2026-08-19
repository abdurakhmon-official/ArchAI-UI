// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

import type { TreeNode } from '@/lib/geometry/types';

 export type ResizeInput = {
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
    width: number;
    length: number;
};