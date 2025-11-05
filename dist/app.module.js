"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("./config/config.module");
const neo4j_module_1 = require("./db/neo4j.module");
const api_controller_1 = require("./api.controller");
const users_module_1 = require("./API/users/users.module");
const posts_module_1 = require("./API/posts/posts.module");
const reviews_module_1 = require("./API/reviews/reviews.module");
const tags_module_1 = require("./API/tags/tags.module");
const ingredients_module_1 = require("./API/ingredients/ingredients.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            neo4j_module_1.Neo4jModule,
            users_module_1.UsersModule,
            posts_module_1.PostsModule,
            reviews_module_1.ReviewsModule,
            tags_module_1.TagsModule,
            ingredients_module_1.IngredientsModule,
        ],
        controllers: [api_controller_1.ApiController],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map