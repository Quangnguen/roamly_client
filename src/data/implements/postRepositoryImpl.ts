import { Post } from "@/src/domain/models/Post"
import { PostRepository } from "../repositories/postRepository"
import { createPost } from "../api/postApi"

export class PostRepositoryImpl implements PostRepository {
    async createPost(post: Post): Promise<Post> {
        const response = await createPost(post)
        return response
    }

    // async getPosts(): Promise<Post[]> {
    //     const response = await getPosts()
    //     return response
    // }

    // async getPostById(id: string): Promise<Post> {
    //     const response = await getPostById(id)
    //     return response
    // }

    // async updatePost(post: Post): Promise<Post> {
    //     const response = await updatePost(post)
    //     return response
    // }

    // async deletePost(id: string): Promise<void> {
    //     await deletePost(id)
    // }
}