import { API_BASE_URL } from "@/src/const/api";
import { authorizedRequest } from "@/src/utils/authorizedRequest";

export const likeApi = async (targetId: string, type: string) => {
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

export const unlikeApi = async (targetId: string, type: string) => {
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
