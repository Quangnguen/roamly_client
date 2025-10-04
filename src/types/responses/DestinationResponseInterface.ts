import { Destination } from '../DestinationInterface';

// Interface cho pagination info
export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Interface cho data structure với destinations và pagination
export interface DestinationData {
    destinations: Destination[];
    pagination: PaginationInfo;
}

export interface DestinationResponseInterface {
    message: string;
    statusCode: number;
    status: string;
    data: Destination[] | DestinationData | Destination; // Support destinations list, paginated data, or single destination
}

// Interface cho search/filter params (nếu cần)
export interface DestinationSearchParams {
    keyword?: string; // query search
    limit?: number;
    page?: number;
}