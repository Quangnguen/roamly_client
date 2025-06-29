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
            console.log('📝 Creating comment:', { postId, content, parentId });
            
            const result = await createCommentApi({
                postId,
                content,
                parentId,
            });
            
            console.log('✅ Comment created successfully:', result);
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
            console.log('📋 Fetching comments for post:', postId);
            
            const comments = await getCommentsApi(postId);
            console.log('✅ Comments fetched successfully:', comments);
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
            console.log('🗑️ Deleting comment:', commentId);
            const result = await deleteCommentApi(commentId);
            
            console.log('✅ Comment deleted successfully:', result);
            return result;
        } catch (error) {
            console.error('❌ Failed to delete comment:', error);
            throw error;
        }
    }
}

// ✅ Export singleton instance
export const commentRepositoryImpl = new CommentRepositoryImpl();