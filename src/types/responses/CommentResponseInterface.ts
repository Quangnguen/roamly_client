import { is } from "date-fns/locale";

export interface CommentResponseInterface {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
  likesCount: number;
  isLiked: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}