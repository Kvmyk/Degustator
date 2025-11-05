import { Controller, Get } from '@nestjs/common';

@Controller()
export class ApiController {
  @Get()
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

  @Get('health')
  healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
