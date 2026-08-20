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
    tagBedrooms?: number[];
    tagStyles?: string[];
    minWidth: number;
    maxWidth: number;
    minLength: number;
    maxLength: number;
    status?: unknown;
};