import {
  ForbiddenException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppPermission, AppRole } from '../../node_modules/.prisma/client';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import {
  AUTHZ_PERMISSIONS_KEY,
  AUTHZ_ROLES_KEY,
} from './authz.decorators';
import { AuthContext } from './auth.types';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : '';
    const authContext = await this.authService.verify(token);

    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(
      AUTHZ_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredPermissions =
      this.reflector.getAllAndOverride<AppPermission[]>(
        AUTHZ_PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (
      requiredRoles?.length &&
      !requiredRoles.includes(authContext.appRole)
    ) {
      throw new ForbiddenException('Missing required role');
    }

    if (
      requiredPermissions?.length &&
      !requiredPermissions.every((permission) =>
        authContext.appPermissions.includes(permission),
      )
    ) {
      throw new ForbiddenException('Missing required permission');
    }

    (request as Request & { auth?: AuthContext }).auth = authContext;
    return true;
  }
}
