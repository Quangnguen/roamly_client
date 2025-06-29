import { API_BASE_URL } from "@/src/const/api";
import { authorizedRequest } from "@/src/utils/authorizedRequest";

// Lấy danh sách cuộc trò chuyện
export const getConversationsApi = async () => {
    return await authorizedRequest(`${API_BASE_URL}/chat/conversation`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
};