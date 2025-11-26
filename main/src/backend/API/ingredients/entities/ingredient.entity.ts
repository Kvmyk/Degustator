export interface Ingredient {
  id: string;
  created_at: Date;
  name: string;
  avg_cost?: number;
  popularity: number; // How many posts use this ingredient
}
