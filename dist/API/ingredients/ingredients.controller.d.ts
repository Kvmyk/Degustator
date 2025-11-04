import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
export declare class IngredientsController {
    private readonly ingredientsService;
    constructor(ingredientsService: IngredientsService);
    createIngredient(createIngredientDto: CreateIngredientDto): Promise<any>;
    getAllIngredients(): Promise<any[]>;
    getPopularIngredients(): Promise<any[]>;
    getIngredientById(id: string): Promise<any>;
    updateIngredient(id: string, updateIngredientDto: UpdateIngredientDto): Promise<any>;
    deleteIngredient(id: string): Promise<{
        message: string;
    }>;
    getPostsByIngredient(id: string): Promise<any[]>;
}
