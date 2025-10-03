import { Destination } from '../DestinationInterface';

export interface DestinationResponseInterface {
    message: string;
    statusCode: number;
    status: string;
    data: Destination[];
}

// Interface cho search/filter params (nếu cần)
export interface DestinationSearchParams {
    q?: string; // query search
    city?: string;
    country?: string;
    category?: string;
    limit?: number;
    page?: number;
}