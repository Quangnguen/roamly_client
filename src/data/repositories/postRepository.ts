import { Post } from "@/src/domain/models/Post";
import { PostSearchResponseInterface, SearchPostParams } from "@/src/types/responses/PostSearchResponseInterface";

export interface PostRepository {
    createPost(formData: FormData): Promise<Post>;
    getPosts(): Promise<Post[]>;
    getPostsByUserId(userId: string): Promise<Post[]>;
    getMyPosts(): Promise<Post[]>;
    deletePost(postId: string): Promise<void>;
    getPostById(postId: string): Promise<Post>;
    updatePost(postId: string, formData: FormData): Promise<Post>;
    getPostsFeed(page: number, limit: number): Promise<Post[]>;
    searchPosts(params: SearchPostParams): Promise<PostSearchResponseInterface>;
    getPostByDestinationId(destinationId: string): Promise<Post[]>;
}