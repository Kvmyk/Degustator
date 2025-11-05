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
exports.ApiController = void 0;
const common_1 = require("@nestjs/common");
let ApiController = class ApiController {
    getApiStatus() {
        return {
            message: 'Welcome to Degustator API',
            version: '1.0.0',
            status: 'running',
            endpoints: {
                users: '/api/users',
                posts: '/api/posts',
                reviews: '/api/reviews',
                tags: '/api/tags',
                ingredients: '/api/ingredients',
            },
        };
    }
    healthCheck() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.ApiController = ApiController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "getApiStatus", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApiController.prototype, "healthCheck", null);
exports.ApiController = ApiController = __decorate([
    (0, common_1.Controller)()
], ApiController);
//# sourceMappingURL=api.controller.js.map