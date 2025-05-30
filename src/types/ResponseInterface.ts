export interface ResponseInterface<T = any> {
    data: T;
    message: string;
    status: number;
    statusCode: number;
}
