export interface Review {
  id: string;
  created_at: Date;
  rating: number;
  content?: string;
  postId: string;
  userId: string;
}
