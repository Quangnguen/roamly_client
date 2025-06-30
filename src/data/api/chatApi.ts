import { API_BASE_URL } from "@/src/const/api";
import { authorizedRequest } from "@/src/utils/authorizedRequest";
import { CreateConversationRequest } from "@/src/types/ConversationResponseInterface";

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

// Gửi tin nhắn
export const sendMessageApi = async (conversationId: string, content: string, files?: any[]) => {
    const formData = new FormData();

    // Thêm conversationId và content vào FormData
    formData.append('conversationId', conversationId);
    formData.append('content', content);

    // Thêm files nếu có
    if (files && files.length > 0) {
        files.forEach((file, index) => {
            formData.append('files', file);
        });
    }

    return await authorizedRequest(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        body: formData,
        // Không set Content-Type header để browser tự động set với boundary cho multipart/form-data
    });
};

// Tạo cuộc trò chuyện mới
export const createConversationApi = async (request: CreateConversationRequest) => {
    return await authorizedRequest(`${API_BASE_URL}/chat/conversation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });
};



