import { API_BASE_URL } from '@/src/const/api';
import { authorizedRequest } from '@/src/utils/authorizedRequest';
import { DestinationResponseInterface, DestinationSearchParams } from '@/src/types/responses/DestinationResponseInterface';

// API để lấy danh sách destinations
export const getPopularDestinationsApi = async () => {
    return await authorizedRequest(`${API_BASE_URL}/destinations/popular?limit=5`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const toggleFavoriteDestinationApi = async (targetId: string, type: string) => {
    return await authorizedRequest(`${API_BASE_URL}/likes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            targetId,
            type
        }),
    });
};

export const untoggleFavoriteDestinationApi = async (targetId: string, type: string) => {
    return await authorizedRequest(`${API_BASE_URL}/likes`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            targetId,
            type
        }),
    });
};

export const searchDestinationsApi = async (params?: DestinationSearchParams) => {
    let url = `${API_BASE_URL}/destinations`;

    // Build query params
    const queryParams = new URLSearchParams();
    if (params?.keyword) queryParams.append('keyword', params.keyword); // Map keyword to q
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
    }

    return await authorizedRequest(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
};


export const getDestinationByIdApi = async (id: string) => {
    return await authorizedRequest(`${API_BASE_URL}/destinations/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const getFavoriteDestinationsApi = async () => {
    return await authorizedRequest(`${API_BASE_URL}/destinations/my-destinations`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const getDestinationsByUserApi = async (userId: string) => {
    return await authorizedRequest(`${API_BASE_URL}/destinations/user/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
