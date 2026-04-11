import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { CustomerAuthContext } from './auth.types';

@Injectable()
export class CustomerGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const customerAuth = await this.authService.verifyCustomer(token);
    (request as Request & { customerAuth?: CustomerAuthContext }).customerAuth = customerAuth;
    return true;
  }
}
