import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/auth.dto';
import { UserResponse } from '../users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { Neo4jService } from '../../db/neo4j.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly neo4jService: Neo4jService,
  ) { }

  // Rejestracja
  async register(createUserDto: CreateUserDto): Promise<UserResponse> {
    const { name, email, password } = createUserDto;

    try {
      // Czy użytkownik istnieje?
      const existing = await this.neo4jService.read(
        'MATCH (u:User {email: $email}) RETURN u',
        { email }
      );

      if (existing.length > 0) {
        throw new BadRequestException('Email already in use');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const id = uuidv4();

      // Tworzenie użytkownika
      const result = await this.neo4jService.write(
        `CREATE (u:User {
          id: $id,
          name: $name,
          email: $email,
          password_hash: $password_hash,
          created_at: datetime()
        }) RETURN u`,
        { id, name, email, password_hash: hashedPassword }
      );

      const userNode = result[0].u;
      const { password_hash, ...userWithoutPassword } = userNode;

      return userWithoutPassword;

    } catch (error) {
      console.error('Błąd rejestracji:', error);
      throw new BadRequestException('Nie udało się utworzyć użytkownika');
    }
  }

  // Logowanie
  async login(loginDto: LoginDto): Promise<{ token: string; user: UserResponse }> {
    const { email, password } = loginDto;

    try {
      const result = await this.neo4jService.read(
        'MATCH (u:User {email: $email}) RETURN u',
        { email }
      );

      if (result.length === 0) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Jeśli Neo4j zwraca node z properties
      const userNode = result[0].u.properties;

      if (!password || !userNode.password_hash) {
        throw new UnauthorizedException('Invalid credentials');
      }

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
    }
  }
}
