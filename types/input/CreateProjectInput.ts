// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

import type { TreeNode } from '@/lib/geometry/types';

 export type CreateProjectInput = {
    title: string;
    note?: (string | undefined) | null;
    styleSlug?: (string | undefined) | null;
    skeletonId?: (string | undefined) | null;
    params: {
        landAreaSotix: number;
        width: number;
        length: number;
        floors?: number;
        rooms?: {
            [x: string]: number;
        };
        kitchen?: "separate" | "combined";
        garage?: number;
        extras?: ("balcony" | "terrace" | "basement" | "sauna" | "pool")[];
        styleSlug?: string | undefined;
        northSide?: ("north" | "east" | "south" | "west") | undefined;
        variants?: number;
        seed?: number | undefined;
        finishLevel?: string;
    };
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
    } | undefined;
};