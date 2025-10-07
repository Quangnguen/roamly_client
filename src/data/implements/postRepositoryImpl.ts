import { Post } from "@/src/domain/models/Post"
import { PostRepository } from "../repositories/postRepository"
import { PostSearchResponseInterface, SearchPostParams } from "@/src/types/responses/PostSearchResponseInterface"
import * as postApi from "../api/postApi"

export class PostRepositoryImpl implements PostRepository {
    async createPost(formData: FormData): Promise<Post> {
        const response = await postApi.createPostApi(formData)
        return response
    }

    async getPosts(): Promise<Post[]> {
        const response = await postApi.getPostsApi()
        return response
    }

    async getPostsByUserId(userId: string): Promise<Post[]> {
        const response = await postApi.getPostsByUserIdApi(userId);
        return response;
    }

    async getMyPosts(): Promise<Post[]> {
        const response = await postApi.getMyPostsApi();
        return response;
    }

    async deletePost(postId: string): Promise<void> {
        const response = await postApi.deletePostApi(postId);
        return response;
    }

    async getPostById(postId: string): Promise<Post> {
        const response = await postApi.getPostByIdApi(postId);
        return response;
    }

    async updatePost(postId: string, formData: FormData): Promise<Post> {
        const response = await postApi.updatePostApi(postId, formData);
        return response;
    }

    async getPostsFeed(page: number, limit: number): Promise<Post[]> {
        const response = await postApi.getPostsFeedApi(page, limit);
        return response;
    }

    async searchPosts(params: SearchPostParams): Promise<PostSearchResponseInterface> {
        const response = await postApi.searchPostsApi(params);
        return response;
    }

    async getPostByDestinationId(destinationId: string): Promise<Post[]> {
        const response = await postApi.getPostByDestinationIdApi(destinationId);
        return response;
    }
}