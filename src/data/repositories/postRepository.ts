import { Post } from "@/src/domain/models/Post";

export interface PostRepository {
    createPost(formData: FormData): Promise<Post>;
}