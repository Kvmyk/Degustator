import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Neo4jService } from '../../db/neo4j.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(private neo4jService: Neo4jService) {}

  async create(createIngredientDto: CreateIngredientDto): Promise<any> {
    try {
      const query = `
        CREATE (i:Ingredient {
          id: randomUUID(),
          name: $name,
          avg_cost: $avg_cost,
          popularity: 0,
          created_at: datetime()
        })
        RETURN i
      `;

      const result = await this.neo4jService.write(query, {
        name: createIngredientDto.name,
        avg_cost: createIngredientDto.avg_cost || 0,
      });

      return result[0].i.properties;
    } catch (error) {
      throw new BadRequestException(`Failed to create ingredient: ${error.message}`);
    }
  }

  async findAll(): Promise<any[]> {
    const query = `
      MATCH (i:Ingredient)
      RETURN i
      LIMIT 100
    `;

    const result = await this.neo4jService.read(query);
    return result.map(r => r.i.properties);
  }

  async findPopular(): Promise<any[]> {
    const query = `
      MATCH (i:Ingredient)
      RETURN i
      ORDER BY i.popularity DESC
      LIMIT 50
    `;

    const result = await this.neo4jService.read(query);
    return result.map(r => r.i.properties);
  }

  async findOne(id: string): Promise<any> {
    const query = `
      MATCH (i:Ingredient { id: $id })
      RETURN i
    `;

    const result = await this.neo4jService.read(query, { id });

    if (result.length === 0) {
      throw new NotFoundException('Ingredient not found');
    }

    return result[0].i.properties;
  }

  async update(id: string, updateIngredientDto: UpdateIngredientDto): Promise<any> {
    try {
      const query = `
        MATCH (i:Ingredient { id: $id })
        SET i += $data
        RETURN i
      `;

      const result = await this.neo4jService.write(query, {
        id,
        data: updateIngredientDto,
      });

      if (result.length === 0) {
        throw new NotFoundException('Ingredient not found');
      }

      return result[0].i.properties;
    } catch (error) {
      throw new BadRequestException(`Failed to update ingredient: ${error.message}`);
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const query = `
      MATCH (i:Ingredient { id: $id })
      DETACH DELETE i
      RETURN id(i) as deletedId
    `;

    const result = await this.neo4jService.write(query, { id });

    if (result.length === 0) {
      throw new NotFoundException('Ingredient not found');
    }

    return { message: 'Ingredient deleted successfully' };
  }

  async getPostsByIngredient(ingredientId: string): Promise<any[]> {
    const query = `
      MATCH (i:Ingredient { id: $ingredientId })<-[:HAS_INGREDIENT]-(p:Post)
      RETURN p
      ORDER BY p.created_at DESC
      LIMIT 100
    `;

    const result = await this.neo4jService.read(query, { ingredientId });
    return result.map(r => r.p.properties);
  }
}
