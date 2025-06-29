import { CommentResponseInterface } from "@/src/types/responses/CommentResponseInterface";
import { CommentResponse } from "../../data/repositories/commentRepository";

export class CommentUsecase {
    constructor(private commentRepository: CommentResponse) { }
    
    async createComment(postId: string, content: string, parentId?: string): Promise<CommentResponseInterface> {
        return await this.commentRepository.createComment(postId, content, parentId) as CommentResponseInterface;
    }

    async getComments(postId: string): Promise<CommentResponseInterface[]> {
        return await this.commentRepository.getComments(postId);
    }

    async deleteComment(commentId: string): Promise<unknown> {
        return await this.commentRepository.deleteComment(commentId);
    }
}