export interface Tag {
  id: string;
  created_at: Date;
  name: string;
  description?: string;
  popularity: number; // How many posts use this tag
}
