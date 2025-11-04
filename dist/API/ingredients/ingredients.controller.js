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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngredientsController = void 0;
const common_1 = require("@nestjs/common");
const ingredients_service_1 = require("./ingredients.service");
const create_ingredient_dto_1 = require("./dto/create-ingredient.dto");
const update_ingredient_dto_1 = require("./dto/update-ingredient.dto");
let IngredientsController = class IngredientsController {
    constructor(ingredientsService) {
        this.ingredientsService = ingredientsService;
    }
    async createIngredient(createIngredientDto) {
        return await this.ingredientsService.create(createIngredientDto);
    }
    async getAllIngredients() {
        return await this.ingredientsService.findAll();
    }
    async getPopularIngredients() {
        return await this.ingredientsService.findPopular();
    }
    async getIngredientById(id) {
        const ingredient = await this.ingredientsService.findOne(id);
        if (!ingredient) {
            throw new common_1.HttpException('Ingredient not found', common_1.HttpStatus.NOT_FOUND);
        }
        return ingredient;
    }
    async updateIngredient(id, updateIngredientDto) {
        return await this.ingredientsService.update(id, updateIngredientDto);
    }
    async deleteIngredient(id) {
        return await this.ingredientsService.remove(id);
    }
    async getPostsByIngredient(id) {
        return await this.ingredientsService.getPostsByIngredient(id);
    }
};
exports.IngredientsController = IngredientsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ingredient_dto_1.CreateIngredientDto]),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "createIngredient", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "getAllIngredients", null);
__decorate([
    (0, common_1.Get)('popular'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "getPopularIngredients", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "getIngredientById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ingredient_dto_1.UpdateIngredientDto]),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "updateIngredient", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "deleteIngredient", null);
__decorate([
    (0, common_1.Get)(':id/posts'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IngredientsController.prototype, "getPostsByIngredient", null);
exports.IngredientsController = IngredientsController = __decorate([
    (0, common_1.Controller)('api/ingredients'),
    __metadata("design:paramtypes", [ingredients_service_1.IngredientsService])
], IngredientsController);
//# sourceMappingURL=ingredients.controller.js.map