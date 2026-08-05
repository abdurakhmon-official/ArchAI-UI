// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type UpdateProfileInput = {
    fullName: string;
    subject?: (string | undefined) | null;
    school_name?: (string | undefined) | null;
    region?: (string | undefined) | null;
    district?: (string | undefined) | null;
    phone?: (string | undefined) | null;
    avatar?: string | undefined;
};