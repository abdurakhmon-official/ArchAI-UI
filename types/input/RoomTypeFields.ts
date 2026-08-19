// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type RoomTypeFields = {
    code: string;
    name: {
        uz: string;
        ru?: string | undefined;
        en?: string | undefined;
    };
    min_area: number;
    max_area: number;
    ideal_ratio?: number;
    needs_exterior_wall?: boolean;
    is_wet_zone?: boolean;
    access_from?: string[];
    furniture_tags?: string[];
    selectable?: boolean;
    max_count?: number;
    default_count?: number;
    sort?: number;
};