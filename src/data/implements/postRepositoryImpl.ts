import { Post } from "@/src/domain/models/Post"
import { PostRepository } from "../repositories/postRepository"
import { createPostApi } from "../api/postApi"

export class PostRepositoryImpl implements PostRepository {
    async createPost(formData: FormData): Promise<Post> {
        const response = await createPostApi(formData)
        return response
    }
}