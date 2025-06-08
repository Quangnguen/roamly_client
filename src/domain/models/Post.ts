export interface Author {
    username: string;
    profilePic: string;
}

export interface PostCount {
    likes: number;
    comments: number;
}

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
    author: Author;
    _count: PostCount;
    score: number;
    isLike: boolean;
    isToday: boolean;
    isFollowing: boolean;
    isSelf: boolean;
    // Optional fields for UI state
    isOptimistic?: boolean;
    isLoading?: boolean;
}