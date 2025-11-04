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
exports.TagsService = void 0;
const common_1 = require("@nestjs/common");
const neo4j_service_1 = require("../../db/neo4j.service");
let TagsService = class TagsService {
    constructor(neo4jService) {
        this.neo4jService = neo4jService;
    }
    async create(createTagDto) {
        try {
            const query = `
        CREATE (t:Tag {
          id: apoc.create.uuid(),
          name: $name,
          description: $description,
          popularity: 0,
          created_at: datetime()
        })
        RETURN t
      `;
            const result = await this.neo4jService.write(query, {
                name: createTagDto.name,
                description: createTagDto.description || null,
            });
            return result[0].t.properties;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create tag: ${error.message}`);
        }
    }
    async findAll() {
        const query = `
      MATCH (t:Tag)
      RETURN t
      LIMIT 100
    `;
        const result = await this.neo4jService.read(query);
        return result.map(r => r.t.properties);
    }
    async findPopular() {
        const query = `
      MATCH (t:Tag)
      RETURN t
      ORDER BY t.popularity DESC
      LIMIT 50
    `;
        const result = await this.neo4jService.read(query);
        return result.map(r => r.t.properties);
    }
    async findOne(id) {
        const query = `
      MATCH (t:Tag { id: $id })
      RETURN t
    `;
        const result = await this.neo4jService.read(query, { id });
        if (result.length === 0) {
            throw new common_1.NotFoundException('Tag not found');
        }
        return result[0].t.properties;
    }
    async update(id, updateTagDto) {
        try {
            const query = `
        MATCH (t:Tag { id: $id })
        SET t += $data
        RETURN t
      `;
            const result = await this.neo4jService.write(query, {
                id,
                data: updateTagDto,
            });
            if (result.length === 0) {
                throw new common_1.NotFoundException('Tag not found');
            }
            return result[0].t.properties;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to update tag: ${error.message}`);
        }
    }
    async remove(id) {
        const query = `
      MATCH (t:Tag { id: $id })
      DETACH DELETE t
      RETURN id(t) as deletedId
    `;
        const result = await this.neo4jService.write(query, { id });
        if (result.length === 0) {
            throw new common_1.NotFoundException('Tag not found');
        }
        return { message: 'Tag deleted successfully' };
    }
    async getPostsByTag(tagId) {
        const query = `
      MATCH (t:Tag { id: $tagId })<-[:HAS_TAG]-(p:Post)
      RETURN p
      ORDER BY p.created_at DESC
      LIMIT 100
    `;
        const result = await this.neo4jService.read(query, { tagId });
        return result.map(r => r.p.properties);
    }
};
exports.TagsService = TagsService;
exports.TagsService = TagsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [neo4j_service_1.Neo4jService])
], TagsService);
//# sourceMappingURL=tags.service.js.map