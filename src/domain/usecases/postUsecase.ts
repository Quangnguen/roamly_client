import { PostRepository } from "@/src/data/repositories/postRepository"
import { Post } from "../models/Post"
import { PostSearchResponseInterface, SearchPostParams } from "@/src/types/responses/PostSearchResponseInterface"

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

  async getPostById(postId: string): Promise<Post> {
    return await this.repo.getPostById(postId)
  }

  async updatePost(postId: string, formData: FormData): Promise<Post> {
    return await this.repo.updatePost(postId, formData)
  }

  async getPostsFeed(page: number, limit: number): Promise<Post[]> {
    return await this.repo.getPostsFeed(page, limit)
  }

  async searchPosts(params: SearchPostParams): Promise<PostSearchResponseInterface> {
    return await this.repo.searchPosts(params)
  }

  async getPostByDestinationId(destinationId: string): Promise<Post[]> {
    return await this.repo.getPostByDestinationId(destinationId)
  }
}