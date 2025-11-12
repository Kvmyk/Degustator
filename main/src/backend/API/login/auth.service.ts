import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponse } from '../users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { Neo4jService } from '../neo4j/neo4j.service'; 

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly neo4jService: Neo4jService,
  ) {}

  // Rejestracja
  async register(createUserDto: CreateUserDto): Promise<UserResponse> {
    const { name, email, password } = createUserDto;
    const session = this.neo4jService.getSession();

    try {
      // Sprawdzenie czy użytkownik istnieje
      const existing = await session.run(
        'MATCH (u:User {email: $email}) RETURN u',
        { email }
      );

      if (existing.records.length > 0) {
        throw new BadRequestException('Email already in use');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const id = uuidv4();

      // Tworzenie nowego użytkownika w Neo4j
      const result = await session.run(
        `CREATE (u:User {
          id: $id,
          name: $name,
          email: $email,
          password_hash: $password_hash,
          created_at: datetime()
        }) RETURN u`,
        { id, name, email, password_hash: hashedPassword }
      );

      const userNode = result.records[0].get('u').properties;
      const { password_hash, ...userWithoutPassword } = userNode;
      return userWithoutPassword;
    } catch (error) {
      console.error('Błąd rejestracji:', error);
      throw new BadRequestException('Nie udało się utworzyć użytkownika');
    } finally {
      await session.close();
    }
  }

  // Logowanie
  async login(loginDto: LoginDto): Promise<{ token: string; user: UserResponse }> {
    const { email, password } = loginDto;
    const session = this.neo4jService.getSession();

    try {
      const result = await session.run(
        'MATCH (u:User {email: $email}) RETURN u',
        { email }
      );

      if (result.records.length === 0) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const userNode = result.records[0].get('u').properties;
      const isPasswordValid = await bcrypt.compare(password, userNode.password_hash);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.jwtService.sign({ sub: userNode.id, email: userNode.email });
      const { password_hash, ...userWithoutPassword } = userNode;

      return { token, user: userWithoutPassword };
    } catch (error) {
      console.error('Błąd logowania:', error);
      throw new UnauthorizedException('Nie udało się zalogować');
    } finally {
      await session.close();
    }
  }
}
