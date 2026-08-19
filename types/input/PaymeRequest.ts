// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type PaymeRequest = {
    method: "CheckPerformTransaction" | "CreateTransaction" | "PerformTransaction" | "CancelTransaction" | "CheckTransaction" | "GetStatement";
    params: {
        [x: string]: unknown;
    };
    id?: (number | string) | undefined;
};