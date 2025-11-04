export interface Post {
    id: string;
    embedding: number[];
    created_at: Date;
    title: string;
    content: string;
    recipe: string;
    photos: string[];
    avg_rating: number;
    likes_count: number;
    vector_id: string;
}
