import { PostRepository } from "@/src/data/repositories/postRepository"
import { Post } from "../models/Post"

export class PostUseCase {
  constructor(private repo: PostRepository) { }

  async createPost(formData: FormData): Promise<Post> {
    return await this.repo.createPost(formData)
  }

  async getPosts(): Promise<Post[]> {
    return await this.repo.getPosts()
  }

  async getPostsByUserId(userId: string): Promise<Post[]> {
    return await this.repo.getPostsByUserId(userId)
  }

  async getMyPosts(): Promise<Post[]> {
    return await this.repo.getMyPosts()
  }

  async deletePost(postId: string): Promise<void> {
    return await this.repo.deletePost(postId)
  }
}