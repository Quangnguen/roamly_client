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

// Interface cho review của destination
export interface ReviewUser {
    id: string;
    username: string;
    name: string;
    profilePic: string | null;
}

export interface Review {
    id: string;
    destinationId: string;
    userId: string;
    rating: number;
    comment: string;
    imageUrl: string[];
    visitDate: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    user: ReviewUser;
}

export interface AddReview {
    rating: number;
    comment: string;
    visitDate: string;
    imageUrl: string[];
}


export interface DestinationResponseInterface {
    message: string;
    statusCode: number;
    status: string;
    data: Destination[] | DestinationData | Destination | Review[]; // Support destinations list, paginated data, single destination, or reviews array
}

// Interface cho search/filter params (nếu cần)
export interface DestinationSearchParams {
    keyword?: string; // query search
    limit?: number;
    page?: number;
}