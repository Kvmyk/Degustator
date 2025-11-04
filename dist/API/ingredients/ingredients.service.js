"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngredientsService = void 0;
const common_1 = require("@nestjs/common");
const neo4j_service_1 = require("../../db/neo4j.service");
let IngredientsService = class IngredientsService {
    constructor(neo4jService) {
        this.neo4jService = neo4jService;
    }
    async create(createIngredientDto) {
        try {
            const query = `
        CREATE (i:Ingredient {
          id: apoc.create.uuid(),
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
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create ingredient: ${error.message}`);
        }
    }
    async findAll() {
        const query = `
      MATCH (i:Ingredient)
      RETURN i
      LIMIT 100
    `;
        const result = await this.neo4jService.read(query);
        return result.map(r => r.i.properties);
    }
    async findPopular() {
        const query = `
      MATCH (i:Ingredient)
      RETURN i
      ORDER BY i.popularity DESC
      LIMIT 50
    `;
        const result = await this.neo4jService.read(query);
        return result.map(r => r.i.properties);
    }
    async findOne(id) {
        const query = `
      MATCH (i:Ingredient { id: $id })
      RETURN i
    `;
        const result = await this.neo4jService.read(query, { id });
        if (result.length === 0) {
            throw new common_1.NotFoundException('Ingredient not found');
        }
        return result[0].i.properties;
    }
    async update(id, updateIngredientDto) {
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
                throw new common_1.NotFoundException('Ingredient not found');
            }
            return result[0].i.properties;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to update ingredient: ${error.message}`);
        }
    }
    async remove(id) {
        const query = `
      MATCH (i:Ingredient { id: $id })
      DETACH DELETE i
      RETURN id(i) as deletedId
    `;
        const result = await this.neo4jService.write(query, { id });
        if (result.length === 0) {
            throw new common_1.NotFoundException('Ingredient not found');
        }
        return { message: 'Ingredient deleted successfully' };
    }
    async getPostsByIngredient(ingredientId) {
        const query = `
      MATCH (i:Ingredient { id: $ingredientId })<-[:HAS_INGREDIENT]-(p:Post)
      RETURN p
      ORDER BY p.created_at DESC
      LIMIT 100
    `;
        const result = await this.neo4jService.read(query, { ingredientId });
        return result.map(r => r.p.properties);
    }
};
exports.IngredientsService = IngredientsService;
exports.IngredientsService = IngredientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [neo4j_service_1.Neo4jService])
], IngredientsService);
//# sourceMappingURL=ingredients.service.js.map