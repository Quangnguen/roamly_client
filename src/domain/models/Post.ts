export interface Post {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    tags: string[];
    authorId: string;
    createdAt: string;
    updatedAt: string;
}