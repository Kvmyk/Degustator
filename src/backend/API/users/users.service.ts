import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

/**
 * Interface definiujący strukturę użytkownika
 * TypeScript zapewnia type safety podczas kompilacji
 */
export interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // ? oznacza opcjonalne pole
}

/**
 * UsersService - Serwis zawierający logikę biznesową
 * 
 * @Injectable() - Dekorator oznaczający, że klasa może być wstrzykiwana przez DI
 * To sprawia, że NestJS może zarządzać tą klasą i wstrzykiwać ją do innych komponentów
 * 
 * Dlaczego używamy serwisów?
 * - Business Logic: Cała logika biznesowa w jednym miejscu
 * - Reużywalność: Może być użyty w wielu kontrolerach
 * - Testowanie: Łatwo testować bez HTTP layer
 * - Single Responsibility: Service zajmuje się tylko logiką, nie HTTP
 */
@Injectable()
export class UsersService {
  /**
   * Symulowana baza danych - w prawdziwym projekcie byłby to TypeORM, Prisma, etc.
   * private - dostępne tylko wewnątrz klasy
   */
  private users: User[] = [
    { id: 1, name: 'Jan Kowalski', email: 'jan@example.com', age: 25 },
    { id: 2, name: 'Anna Nowak', email: 'anna@example.com', age: 30 },
  ];

  private nextId = 3; // Licznik dla nowych ID

  /**
   * Pobiera wszystkich użytkowników
   * Prosta metoda zwracająca tablicę
   */
  findAll(): User[] {
    return this.users;
  }

  /**
   * Znajduje użytkownika po ID
   * 
   * Dlaczego rzucamy wyjątek zamiast zwracać null?
   * - NestJS automatycznie konwertuje wyjątki na odpowiednie kody HTTP
   * - NotFoundException → 404 Not Found
   * - Klient API dostaje spójną strukturę błędu
   */
  findOne(id: number): User {
    const user = this.users.find(u => u.id === id);
    
    if (!user) {
      throw new NotFoundException(`Użytkownik o ID ${id} nie został znaleziony`);
    }
    
    return user;
  }

  /**
   * Tworzy nowego użytkownika
   * 
   * CreateUserDto zapewnia:
   * - Type safety
   * - Automatyczną walidację (jeśli użyjemy class-validator)
   * - Dokumentację API (przy użyciu Swagger)
   */
  create(createUserDto: CreateUserDto): User {
    const newUser: User = {
      id: this.nextId++,
      ...createUserDto, // Spread operator - kopiuje wszystkie pola z DTO
    };
    
    this.users.push(newUser);
    return newUser;
  }

  /**
   * Aktualizuje użytkownika
   * 
   * Strategia:
   * 1. Znajdź użytkownika (rzuć wyjątek jeśli nie istnieje)
   * 2. Zaktualizuj pola
   * 3. Zwróć zaktualizowanego użytkownika
   */
  update(id: number, updateUserDto: UpdateUserDto): User {
    const user = this.findOne(id); // Użyjemy istniejącej metody
    
    // Object.assign kopiuje właściwości z updateUserDto do user
    Object.assign(user, updateUserDto);
    
    return user;
  }

  /**
   * Usuwa użytkownika
   * 
   * Zwraca void - DELETE nie powinien zwracać danych (204 No Content)
   */
  remove(id: number): void {
    const index = this.users.findIndex(u => u.id === id);
    
    if (index === -1) {
      throw new NotFoundException(`Użytkownik o ID ${id} nie został znaleziony`);
    }
    
    this.users.splice(index, 1);
  }
}
