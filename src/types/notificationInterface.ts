export interface Notification {
    id: string;
    type: string;
    message: string;
    isRead: boolean;
    senderId: string;
    recipientId: string;
    postId: string;
    sharedPostId: string;
    data: any;
    createdAt: string;
    sender: {
        id: string;
        username: string;
        profilePic: string;
    };
    post?: {
        id: string;
        imageUrl: string[];
    };
}
