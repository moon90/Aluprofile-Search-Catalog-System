import { SetMetadata } from '@nestjs/common';
import { AppPermission, AppRole } from '../../node_modules/.prisma/client';

export const AUTHZ_ROLES_KEY = 'authz_roles';
export const AUTHZ_PERMISSIONS_KEY = 'authz_permissions';

export const RequireRoles = (...roles: AppRole[]) =>
  SetMetadata(AUTHZ_ROLES_KEY, roles);

export const RequirePermissions = (...permissions: AppPermission[]) =>
  SetMetadata(AUTHZ_PERMISSIONS_KEY, permissions);
