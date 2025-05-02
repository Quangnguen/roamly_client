import { PostRepository } from "@/src/data/repositories/postRepository"
import { Post } from "../models/Post"


export class PostUseCase {
  constructor(private repo: PostRepository) {}

  async createPost(post : Post ): Promise<Post> {
    return await this.repo.createPost(post)
  }
  
}
