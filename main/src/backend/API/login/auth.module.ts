import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { Neo4jModule } from '../neo4j/neo4j.module'; 

@Module({
  imports: [
    JwtModule.register({
      secret: 'TWOJ_SEKRET_JWT', 
      signOptions: { expiresIn: '1h' },
    }),
    Neo4jModule, 
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
