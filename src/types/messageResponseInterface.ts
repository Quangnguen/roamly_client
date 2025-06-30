export interface Sender {
    id: string;
    username: string;
    profilePic: string;
}

export interface SendMessageRequest {
    conversationId: string;
    content: string;
    files?: any[];
}

export interface MessageResponseInterface {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    deletedForAll: boolean;
    seenBy: string[];
    mediaUrls: string[];
    mediaType: string | null;
    pinned: boolean;
    sender: Sender;
}