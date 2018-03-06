export interface apiConfigInterface {
    protocol: string;
    host: string;
    dataApiUrl: string;
    applicationApiUrl: string;
}


export const apiConfig: apiConfigInterface = {
    protocol: "http",
    host: "localhost:9999",
    dataApiUrl: "data",
    applicationApiUrl: ""
}

export const apiRequestTypeAccount:string = "ACCOUNT";
export const apiRequestTypeUser:string = "USER";
