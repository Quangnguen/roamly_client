import { Post } from "@/src/domain/models/Post";


export interface PostRepository {
    createPost(post: Post): Promise<Post>;
    // getPosts(): Promise<Post[]>;
    // getPostById(id: string): Promise<Post | null>;
    // updatePost(post: Post): Promise<Post>;
    // deletePost(id: string): Promise<void>;
}