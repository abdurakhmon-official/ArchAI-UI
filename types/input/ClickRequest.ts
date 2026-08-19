// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type ClickRequest = {
    click_trans_id?: string;
    service_id?: string;
    merchant_trans_id?: string;
    merchant_prepare_id?: string | undefined;
    amount: number;
    action: number;
    error?: number | undefined;
    error_note?: string | undefined;
    sign_time: string;
    sign_string: string;
};