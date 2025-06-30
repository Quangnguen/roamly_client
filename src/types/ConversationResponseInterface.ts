export interface User {
    id: string;
    username: string;
    profilePic: string;
}

export interface Participant {
    id: string;
    conversationId: string;
    userId: string;
    joinedAt: string;
    user: User;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    deletedForAll?: boolean;
    seenBy?: any[];
    mediaUrls?: string[];
    mediaType?: string;
    pinned?: boolean;
    sender?: any;
    preview?: string;
}


// Rename Conversation thành ConversationResponseInterface (giống pattern FollowingResponseInterface)
export interface ConversationResponseInterface {
    id: string;
    isGroup: boolean;
    name: string | null;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    participants: Participant[];
    lastMessage: Message | string | null;
}

// Interface cho request tạo conversation mới
export interface CreateConversationRequest {
    userIds: string[];
}
