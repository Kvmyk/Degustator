import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';

/**
 * AppModule - Główny moduł aplikacji
 * 
 * @Module to dekorator, który definiuje moduł w NestJS.
 * Moduły organizują kod w logiczne grupy - to podstawa architektury NestJS.
 * 
 * Dlaczego używamy modułów?
 * - Enkapsulacja: Każdy moduł zawiera powiązane komponenty
 * - Dependency Injection: NestJS wie, jak wstrzykiwać zależności między modułami
 * - Skalowalność: Łatwo dodawać nowe funkcjonalności
 */
@Module({
  imports: [
    UsersModule, // Importujemy moduł użytkowników
  ],
  controllers: [], // Tutaj mogłyby być kontrolery globalne
  providers: [],   // Tutaj mogłyby być serwisy globalne
})
export class AppModule {}
