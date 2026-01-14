import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info) {
        // No error is thrown if no user is found
        return user;
    }
}
