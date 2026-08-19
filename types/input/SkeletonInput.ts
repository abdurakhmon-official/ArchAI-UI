// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

import type { TreeNode } from '@/lib/geometry/types';

 export type SkeletonInput = {
    name: string;
    floors: number;
    tree: {
        floors: {
            level: number;
            tree: TreeNode;
        }[];
    };
    tag_bedrooms?: number[];
    tag_styles?: string[];
    min_width: number;
    max_width: number;
    min_length: number;
    max_length: number;
    status?: unknown;
};