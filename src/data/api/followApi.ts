import { API_BASE_URL } from "@/src/const/api";
import { authorizedRequest } from "@/src/utils/authorizedRequest";

// Theo dõi người dùng khác
export const followApi = async (followingId: string) => {
    return await authorizedRequest(`${API_BASE_URL}/follows`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ followingId }),
    });
};

// Hủy theo dõi người dùng khác
export const unfollowApi = async (followingId: string) => {
    return await authorizedRequest(`${API_BASE_URL}/follows/${followingId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

// Lấy danh sách người theo dõi
export const getFollowersApi = async (userId: string) => {
    return await authorizedRequest(`${API_BASE_URL}/follows/followers/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

// Lấy danh sách đang theo dõi
export const getFollowingApi = async () => {
    return await authorizedRequest(`${API_BASE_URL}/follows/following`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

