import { API_BASE_URL } from "@/src/const/api";
import { authorizedRequest } from "@/src/utils/authorizedRequest";
import { CommentResponseInterface } from "@/src/types/responses/CommentResponseInterface";

/**
 * ✅ Create new comment
 * @POST /comments
 */
export const createCommentApi = async (params: {
  postId: string;
  content: string;
  parentId?: string;
}): Promise<CommentResponseInterface> => {
  return await authorizedRequest(`${API_BASE_URL}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      postId: params.postId,
      content: params.content,
      parentId: params.parentId,
    }),
  });
};

/**
 * ✅ Get comments for a post
 * @GET /comments/:postId
 */
export const getCommentsApi = async (postId: string): Promise<CommentResponseInterface[]> => {
  return await authorizedRequest(`${API_BASE_URL}/comments/${postId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * ✅ Delete comment
 * @DELETE /comments/:id
 */
export const deleteCommentApi = async (commentId: string): Promise<{ success: boolean; message?: string }> => {
  return await authorizedRequest(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * ✅ Export grouped API object
 */
export const commentApi = {
  create: createCommentApi,
  getByPost: getCommentsApi,
  delete: deleteCommentApi,
};