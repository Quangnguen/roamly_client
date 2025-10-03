import { API_BASE_URL } from '@/src/const/api';
import { authorizedRequest } from '@/src/utils/authorizedRequest';
import { DestinationResponseInterface, DestinationSearchParams } from '@/src/types/responses/DestinationResponseInterface';

// API để lấy danh sách destinations
export const getDestinationsApi = async (params?: DestinationSearchParams): Promise<DestinationResponseInterface> => {
    let url = `${API_BASE_URL}/destinations`;

    // Build query params
    const queryParams = new URLSearchParams();
    if (params?.q) queryParams.append('q', params.q);
    if (params?.city) queryParams.append('city', params.city);
    if (params?.country) queryParams.append('country', params.country);
    if (params?.category) queryParams.append('category', params.category);
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

export const getPopularDestinationsApi = async () => {
    return await authorizedRequest(`${API_BASE_URL}/destinations/popular?limit=5`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
};