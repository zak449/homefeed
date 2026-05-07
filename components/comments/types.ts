export interface CommentNode {
  id: string;
  content: string;
  createdAt: string;
  editedAt: string | null;
  likeCount: number;
  isRedFlag: boolean;
  liked: boolean;
  parentId: string | null;
  user: {
    id: string | null;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
  } | null;
  // legacy anonymous fallback
  legacyName?: string | null;
  replies: CommentNode[];
}
