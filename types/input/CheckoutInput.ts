// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type CheckoutInput = {
    planCode: string;
    provider: unknown;
    months?: number;
    returnUrl?: string | undefined;
};