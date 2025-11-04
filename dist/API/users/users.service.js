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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const neo4j_service_1 = require("../../db/neo4j.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(neo4jService) {
        this.neo4jService = neo4jService;
    }
    async create(createUserDto) {
        try {
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const query = `
        CREATE (u:User {
          id: apoc.create.uuid(),
          name: $name,
          email: $email,
          password_hash: $password_hash,
          photo_url: $photo_url,
          bio: $bio,
          created_at: datetime()
        })
        RETURN u
      `;
            const result = await this.neo4jService.write(query, {
                name: createUserDto.name,
                email: createUserDto.email,
                password_hash: hashedPassword,
                photo_url: createUserDto.photo_url || null,
                bio: createUserDto.bio || null,
            });
            const user = result[0].u.properties;
            return this.excludePassword(user);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create user: ${error.message}`);
        }
    }
    async findAll() {
        const query = `
      MATCH (u:User)
      RETURN u
      LIMIT 100
    `;
        const result = await this.neo4jService.read(query);
        return result.map(r => this.excludePassword(r.u.properties));
    }
    async findOne(id) {
        const query = `
      MATCH (u:User { id: $id })
      RETURN u
    `;
        const result = await this.neo4jService.read(query, { id });
        if (result.length === 0) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.excludePassword(result[0].u.properties);
    }
    async update(id, updateUserDto) {
        try {
            const query = `
        MATCH (u:User { id: $id })
        SET u += $data
        RETURN u
      `;
            const result = await this.neo4jService.write(query, {
                id,
                data: updateUserDto,
            });
            if (result.length === 0) {
                throw new common_1.NotFoundException('User not found');
            }
            return this.excludePassword(result[0].u.properties);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to update user: ${error.message}`);
        }
    }
    async remove(id) {
        const query = `
      MATCH (u:User { id: $id })
      DETACH DELETE u
      RETURN id(u) as deletedId
    `;
        const result = await this.neo4jService.write(query, { id });
        if (result.length === 0) {
            throw new common_1.NotFoundException('User not found');
        }
        return { message: 'User deleted successfully' };
    }
    async getFollowers(userId) {
        const query = `
      MATCH (u:User { id: $userId })<-[:FOLLOWS]-(follower:User)
      RETURN follower
      LIMIT 50
    `;
        const result = await this.neo4jService.read(query, { userId });
        return result.map(r => this.excludePassword(r.follower.properties));
    }
    async getFollowing(userId) {
        const query = `
      MATCH (u:User { id: $userId })-[:FOLLOWS]->(following:User)
      RETURN following
      LIMIT 50
    `;
        const result = await this.neo4jService.read(query, { userId });
        return result.map(r => this.excludePassword(r.following.properties));
    }
    async followUser(userId, targetUserId) {
        try {
            const query = `
        MATCH (u:User { id: $userId }), (f:User { id: $targetUserId })
        MERGE (u)-[:FOLLOWS]->(f)
        RETURN u, f
      `;
            await this.neo4jService.write(query, { userId, targetUserId });
            return { message: 'User followed successfully' };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to follow user: ${error.message}`);
        }
    }
    async unfollowUser(userId, targetUserId) {
        try {
            const query = `
        MATCH (u:User { id: $userId })-[r:FOLLOWS]->(f:User { id: $targetUserId })
        DELETE r
        RETURN u, f
      `;
            await this.neo4jService.write(query, { userId, targetUserId });
            return { message: 'User unfollowed successfully' };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to unfollow user: ${error.message}`);
        }
    }
    async getUserPosts(userId) {
        const query = `
      MATCH (u:User { id: $userId })-[:CREATED]->(p:Post)
      RETURN p
      ORDER BY p.created_at DESC
      LIMIT 50
    `;
        const result = await this.neo4jService.read(query, { userId });
        return result.map(r => r.p.properties);
    }
    async getLikedPosts(userId) {
        const query = `
      MATCH (u:User { id: $userId })-[:LIKES]->(p:Post)
      RETURN p
      ORDER BY p.created_at DESC
      LIMIT 50
    `;
        const result = await this.neo4jService.read(query, { userId });
        return result.map(r => r.p.properties);
    }
    excludePassword(user) {
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [neo4j_service_1.Neo4jService])
], UsersService);
//# sourceMappingURL=users.service.js.map