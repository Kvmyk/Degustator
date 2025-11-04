export interface User {
    id: string;
    embedding: number[];
    created_at: Date;
    email: string;
    password_hash: string;
    name: string;
    photo_url?: string;
    bio?: string;
}
export interface UserResponse {
    id: string;
    created_at: Date;
    email: string;
    name: string;
    photo_url?: string;
    bio?: string;
}
