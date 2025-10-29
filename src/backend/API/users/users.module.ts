import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/**
 * UsersModule - Moduł zarządzający użytkownikami
 * 
 * Ten moduł grupuje wszystkie komponenty związane z użytkownikami:
 * - Controller (obsługuje HTTP requests)
 * - Service (zawiera logikę biznesową)
 * 
 * Dlaczego tak?
 * - Separation of Concerns: Każda warstwa ma swoją odpowiedzialność
 * - Testowanie: Łatwiej testować poszczególne komponenty
 * - Reużywalność: Service może być wstrzyknięty do innych kontrolerów
 */
@Module({
  controllers: [UsersController], // Rejestrujemy kontroler
  providers: [UsersService],      // Rejestrujemy serwis (provider)
  exports: [UsersService],        // Eksportujemy serwis, aby inne moduły mogły go używać
})
export class UsersModule {}
