import { is } from "date-fns/locale";

export interface CommentResponseInterface {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
  likeCount: number; // Sửa từ likesCount thành likeCount để match API
  isLiked: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  isOptimistic?: boolean; // For optimistic updates
  author?: {
    id: string;
    username: string;
    profilePic: string;
  };
}