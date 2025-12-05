import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'TWOJ_SEKRET_JWT', // ten sam, co w AuthModule
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, email: payload.email };
  }
}
