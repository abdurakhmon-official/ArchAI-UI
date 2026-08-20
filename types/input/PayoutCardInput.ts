// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type PayoutCardInput = {
    provider: unknown;
    label: string;
    last4: string;
    holder: string;
    expiry: string;
    accountId: string;
};