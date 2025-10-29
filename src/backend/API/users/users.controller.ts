import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

/**
 * UsersController - Kontroler REST API dla użytkowników
 * 
 * @Controller('users') - Dekorator definiujący kontroler z prefixem 'users'
 * Wszystkie endpointy będą miały prefiks /users
 * 
 * Kontroler to warstwa, która:
 * 1. Odbiera HTTP requests
 * 2. Waliduje dane wejściowe
 * 3. Deleguje logikę do serwisu
 * 4. Zwraca odpowiedź HTTP
 * 
 * Dlaczego kontroler nie zawiera logiki biznesowej?
 * - Single Responsibility: Kontroler tylko obsługuje HTTP
 * - Testowanie: Łatwiej testować czystą logikę w serwisie
 * - Reużywalność: Ta sama logika może być użyta w różnych kontekstach
 */
@Controller('users')
export class UsersController {
  /**
   * Dependency Injection w konstruktorze
   * 
   * NestJS automatycznie wstrzykuje instancję UsersService
   * Nie musimy ręcznie tworzyć new UsersService() - framework robi to za nas
   * 
   * Dlaczego DI jest ważne?
   * - Loose Coupling: Komponenty są luźno powiązane
   * - Testing: Łatwo mockować zależności w testach
   * - Singleton: NestJS zarządza cyklem życia obiektów
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   * Pobiera wszystkich użytkowników
   * 
   * @Get() - Dekorator definiujący endpoint GET
   * Bez parametru oznacza bazowy routing (/users)
   */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * GET /users/:id
   * Pobiera użytkownika po ID
   * 
   * @Param('id') - Ekstrakt parametru z URL
   * :id w dekoratorze definiuje parametr dynamiczny
   * 
   * Przykład: GET /users/1 → id = '1'
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id); // +id konwertuje string na number
  }

  /**
   * POST /users
   * Tworzy nowego użytkownika
   * 
   * @Post() - Dekorator dla HTTP POST
   * @Body() - Ekstrakt body z requesta i automatyczna walidacja przez DTO
   * 
   * DTO (Data Transfer Object) definiuje strukturę danych i walidację
   * NestJS automatycznie waliduje dane wejściowe przed przekazaniem do metody
   */
  @Post()
  @HttpCode(HttpStatus.CREATED) // Zwraca 201 Created zamiast domyślnego 200 OK
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * PUT /users/:id
   * Aktualizuje użytkownika
   * 
   * @Put() - Dekorator dla HTTP PUT (pełna aktualizacja)
   * Możemy użyć @Patch() dla częściowej aktualizacji
   * 
   * Używamy zarówno @Param() jak i @Body() - parametr z URL + dane z body
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  /**
   * DELETE /users/:id
   * Usuwa użytkownika
   * 
   * @Delete() - Dekorator dla HTTP DELETE
   * @HttpCode(204) - No Content, standardowa odpowiedź dla DELETE
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
