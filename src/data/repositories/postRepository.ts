import { Post } from "@/src/domain/models/Post";

export interface PostRepository {
    createPost(formData: FormData): Promise<Post>;
    getPosts(): Promise<Post[]>;
    getPostsByUserId(userId: string): Promise<Post[]>;
    getMyPosts(): Promise<Post[]>;
}