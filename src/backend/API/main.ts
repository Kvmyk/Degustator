import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * main.ts - Punkt wejścia aplikacji NestJS
 * 
 * To jest plik startowy aplikacji. NestFactory.create() tworzy instancję aplikacji
 * wykorzystując moduł główny (AppModule). Jest to wzorzec Factory z NestJS.
 */
async function bootstrap() {
  // Tworzymy aplikację NestJS z głównego modułu
  const app = await NestFactory.create(AppModule);
  
  // Włączamy CORS (Cross-Origin Resource Sharing) - pozwala frontendowi komunikować się z API
  app.enableCors();
  
  // Uruchamiamy serwer na porcie 3000
  await app.listen(3000);
  
  console.log('🚀 Aplikacja NestJS działa na http://localhost:3000');
}

bootstrap();
