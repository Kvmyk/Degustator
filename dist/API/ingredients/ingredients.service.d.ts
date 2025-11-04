import { Neo4jService } from '../../db/neo4j.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
export declare class IngredientsService {
    private neo4jService;
    constructor(neo4jService: Neo4jService);
    create(createIngredientDto: CreateIngredientDto): Promise<any>;
    findAll(): Promise<any[]>;
    findPopular(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateIngredientDto: UpdateIngredientDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getPostsByIngredient(ingredientId: string): Promise<any[]>;
}
