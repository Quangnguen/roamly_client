import { is } from "date-fns/locale";

export interface CommentResponseInterface {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
  likeCount: number;
  isLike: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    profilePic: string;
  };
  likes: Array<{
    user: {
      id: string;
      username: string;
      profilePic: string;
    };
  }>;
  replies: Array<CommentResponseInterface | { replies: Array<CommentResponseInterface> }>;
  isOptimistic?: boolean;
}