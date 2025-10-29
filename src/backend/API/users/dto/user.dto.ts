import { IsString, IsEmail, IsInt, IsOptional, MinLength, Min } from 'class-validator';

/**
 * DTO (Data Transfer Object) - Obiekty transferu danych
 * 
 * Dlaczego używamy DTO?
 * 1. Walidacja: Automatyczna walidacja danych wejściowych
 * 2. Type Safety: TypeScript sprawdza typy podczas kompilacji
 * 3. Dokumentacja: Jasno definiuje, jakie dane są wymagane
 * 4. Transformacja: Można automatycznie transformować dane
 * 5. Security: Zapobiega przesyłaniu nieoczekiwanych pól
 * 
 * class-validator: Biblioteka do walidacji używająca dekoratorów
 * Dekoratory walidacyjne sprawdzają dane PRZED przekazaniem do metody
 */

/**
 * CreateUserDto - DTO dla tworzenia użytkownika
 * Definiuje, jakie dane są wymagane przy POST /users
 */
export class CreateUserDto {
  @IsString({ message: 'Imię musi być tekstem' })
  @MinLength(2, { message: 'Imię musi mieć minimum 2 znaki' })
  name: string;

  @IsEmail({}, { message: 'Podaj prawidłowy adres email' })
  email: string;

  @IsOptional() // To pole jest opcjonalne
  @IsInt({ message: 'Wiek musi być liczbą całkowitą' })
  @Min(0, { message: 'Wiek nie może być ujemny' })
  age?: number;
}

/**
 * UpdateUserDto - DTO dla aktualizacji użytkownika
 * Wszystkie pola są opcjonalne - możemy zaktualizować tylko wybrane pola
 * 
 * Partial<CreateUserDto> to TypeScript utility type, które czyni wszystkie pola opcjonalnymi
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Imię musi być tekstem' })
  @MinLength(2, { message: 'Imię musi mieć minimum 2 znaki' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Podaj prawidłowy adres email' })
  email?: string;

  @IsOptional()
  @IsInt({ message: 'Wiek musi być liczbą całkowitą' })
  @Min(0, { message: 'Wiek nie może być ujemny' })
  age?: number;
}
