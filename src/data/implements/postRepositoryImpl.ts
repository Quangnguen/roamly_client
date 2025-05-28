import { Post } from "@/src/domain/models/Post"
import { PostRepository } from "../repositories/postRepository"
import { createPostApi, getPostsApi } from "../api/postApi"

export class PostRepositoryImpl implements PostRepository {
    async createPost(formData: FormData): Promise<Post> {
        const response = await createPostApi(formData)
        return response
    }

    async getPosts(): Promise<Post[]> {
        const response = await getPostsApi()
        return response
    }
}