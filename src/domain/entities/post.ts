export interface Post {
    id: string;
    authorId: string;
    imageUrl: string[];
    caption: string;
    location: string | null;
    tags: string[];
    isPublic: boolean;
    likeCount: number;
    commentCount: number;
    sharedCount: number;
    createdAt: string;
    updatedAt: string;
    author: {
        username: string;
        profilePic: string | null;
    };
} 