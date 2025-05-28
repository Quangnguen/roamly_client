import { PostRepository } from "@/src/data/repositories/postRepository"
import { Post } from "../models/Post"

export class PostUseCase {
  constructor(private repo: PostRepository) { }

  async createPost(formData: FormData): Promise<Post> {
    return await this.repo.createPost(formData)
  }
}