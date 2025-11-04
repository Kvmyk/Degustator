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
var Neo4jService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Neo4jService = void 0;
const common_1 = require("@nestjs/common");
const neo4j = require("neo4j-driver");
const config_1 = require("@nestjs/config");
let Neo4jService = Neo4jService_1 = class Neo4jService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(Neo4jService_1.name);
    }
    onModuleInit() {
        const uri = this.configService.get('NEO4J_URI') || 'neo4j://localhost:7687';
        const username = this.configService.get('NEO4J_USERNAME') || 'neo4j';
        const password = this.configService.get('NEO4J_PASSWORD') || 'password';
        try {
            this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
            this.logger.log('✓ Neo4j connected successfully');
        }
        catch (error) {
            this.logger.error('✗ Failed to connect to Neo4j', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        if (this.driver) {
            await this.driver.close();
            this.logger.log('Neo4j connection closed');
        }
    }
    getDriver() {
        return this.driver;
    }
    async read(query, params) {
        const session = this.driver.session({ defaultAccessMode: neo4j.session.READ });
        try {
            const result = await session.run(query, params);
            return result.records.map(record => record.toObject());
        }
        catch (error) {
            this.logger.error(`Read query failed: ${query}`, error);
            throw error;
        }
        finally {
            await session.close();
        }
    }
    async write(query, params) {
        const session = this.driver.session({ defaultAccessMode: neo4j.session.WRITE });
        try {
            const result = await session.run(query, params);
            return result.records.map(record => record.toObject());
        }
        catch (error) {
            this.logger.error(`Write query failed: ${query}`, error);
            throw error;
        }
        finally {
            await session.close();
        }
    }
};
exports.Neo4jService = Neo4jService;
exports.Neo4jService = Neo4jService = Neo4jService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], Neo4jService);
//# sourceMappingURL=neo4j.service.js.map