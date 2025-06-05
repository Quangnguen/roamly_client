import { API_BASE_URL } from "@/src/const/api"
import { authorizedRequest } from "@/src/utils/authorizedRequest";

export const getNotificationsApi = async () => {
    return await authorizedRequest(`${API_BASE_URL}/notifications`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const markAsReadApi = async (notificationId: string) => {
    return await authorizedRequest(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'POST',
    });
};
