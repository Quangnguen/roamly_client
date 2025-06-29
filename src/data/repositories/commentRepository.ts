import { CommentResponseInterface } from "@/src/types/responses/CommentResponseInterface";

export interface CommentResponse {
    createComment(postId: string, content: string, parentId?: string): Promise<unknown>;
    getComments(postId: string): Promise<CommentResponseInterface[]>;
    deleteComment(commentId: string): Promise<unknown>;
}