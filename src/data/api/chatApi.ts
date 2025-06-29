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

export const getMessagesApi = async (conversationId: string, limit: number, before: string) => {
    let url = `${API_BASE_URL}/chat/message/${conversationId}`;
    if (limit != 0 && before != "test") {
        url = `${API_BASE_URL}/chat/message/${conversationId}?limit=${limit}&before=${before}`;
    }
    return await authorizedRequest(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

