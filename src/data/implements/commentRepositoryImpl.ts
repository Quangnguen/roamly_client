import { CommentResponse } from "../repositories/commentRepository";
import { CommentResponseInterface } from "@/src/types/responses/CommentResponseInterface";
import { createCommentApi, getCommentsApi, deleteCommentApi } from "../api/commentApi";

export class CommentRepositoryImpl implements CommentResponse {
    /**
     * ✅ Create new comment
     * @param postId - ID of the post
     * @param content - Comment content
     * @param parentId - Parent comment ID (for replies)
     * @returns Promise<CommentResponseInterface>
     */
    async createComment(postId: string, content: string, parentId?: string): Promise<CommentResponseInterface> {
        try {
            
            const result = await createCommentApi({
                postId,
                content,
                parentId,
            });
            
            return result;
        } catch (error) {
            console.error('❌ Failed to create comment:', error);
            throw error;
        }
    }

    /**
     * ✅ Get comments for a post
     * @param postId - ID of the post
     * @returns Promise<CommentResponseInterface[]>
     */
    async getComments(postId: string): Promise<CommentResponseInterface[]> {
        try {
            
            const comments = await getCommentsApi(postId);
            return comments;
        } catch (error) {
            console.error('❌ Failed to fetch comments:', error);
            throw error;
        }
    }

    /**
     * ✅ Delete comment
     * @param commentId - ID of the comment to delete
     * @returns Promise<{ success: boolean; message?: string }>
     */
    async deleteComment(commentId: string): Promise<{ success: boolean; message?: string }> {
        try {
            const result = await deleteCommentApi(commentId);
            
            return result;
        } catch (error) {
            console.error('❌ Failed to delete comment:', error);
            throw error;
        }
    }
}

// ✅ Export singleton instance
export const commentRepositoryImpl = new CommentRepositoryImpl();