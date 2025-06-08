import { Post } from "@/src/domain/models/Post";

export interface PostRepository {
    createPost(formData: FormData): Promise<Post>;
    getPosts(): Promise<Post[]>;
    getPostsByUserId(userId: string): Promise<Post[]>;
    getMyPosts(): Promise<Post[]>;
    deletePost(postId: string): Promise<void>;
    getPostById(postId: string): Promise<Post>;
    updatePost(postId: string, formData: FormData): Promise<Post>;
    getPostsFeed(page: number, limit: number): Promise<Post[]>;
}