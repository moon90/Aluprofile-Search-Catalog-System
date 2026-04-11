import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { AppPermission, AppRole } from '../../node_modules/.prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthContext } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private get secretKey() {
    const value = process.env.CLERK_SECRET_KEY;
    if (!value) {
      throw new InternalServerErrorException(
        'CLERK_SECRET_KEY is not configured',
      );
    }
    return value;
  }

  private get bootstrapAdminUserIds() {
    return (process.env.CLERK_BOOTSTRAP_ADMIN_USER_IDS ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private async verifyIdentity(token: string) {
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const payload = (await verifyToken(token, {
      secretKey: this.secretKey,
    })) as {
      sub?: string;
      org_role?: string;
      org_permissions?: string[];
    };

    const clerkUserId = payload.sub ?? '';
    if (!clerkUserId) {
      throw new UnauthorizedException('Token missing user id');
    }

    return { clerkUserId };
  }

  async verifyCustomer(token: string) {
    return this.verifyIdentity(token);
  }

  async verify(token: string) {
    const { clerkUserId } = await this.verifyIdentity(token);

    const bootstrap = this.bootstrapAdminUserIds.includes(clerkUserId);
    if (bootstrap) {
      return {
        clerkUserId,
        appRole: AppRole.ADMIN,
        appPermissions: Object.values(AppPermission),
        source: 'bootstrap',
      } satisfies AuthContext;
    }

    const access = await this.prisma.userAccess.findUnique({
      where: { clerkUserId },
    });

    if (!access) {
      throw new UnauthorizedException('No access configured for this user');
    }

    return {
      clerkUserId,
      appRole: access.role,
      appPermissions: access.permissions,
      source: 'database',
    } satisfies AuthContext;
  }

  async getAccessCheck(token: string) {
    const { clerkUserId } = await this.verifyIdentity(token);
    const requiredRole = AppRole.ADMIN;
    const requiredPermissions = [
      AppPermission.VIEW_ADMIN,
      AppPermission.USERS_MANAGE,
      AppPermission.PROFILES_MANAGE,
      AppPermission.SUPPLIERS_MANAGE,
      AppPermission.CATEGORIES_MANAGE,
    ];

    const bootstrap = this.bootstrapAdminUserIds.includes(clerkUserId);
    if (bootstrap) {
      const allPermissions = Object.values(AppPermission);
      return {
        ok: true,
        clerkUserId,
        source: 'bootstrap' as const,
        role: AppRole.ADMIN,
        permissions: allPermissions,
        required: {
          role: requiredRole,
          permissions: requiredPermissions,
        },
        missing: {
          role: false,
          permissions: [] as AppPermission[],
        },
        reason: [] as string[],
      };
    }

    const access = await this.prisma.userAccess.findUnique({
      where: { clerkUserId },
    });

    if (!access) {
      return {
        ok: false,
        clerkUserId,
        source: 'none' as const,
        role: null,
        permissions: [] as AppPermission[],
        required: {
          role: requiredRole,
          permissions: requiredPermissions,
        },
        missing: {
          role: true,
          permissions: requiredPermissions,
        },
        reason: ['NO_USER_ACCESS_RECORD'],
      };
    }

    const missingRole = access.role !== requiredRole;
    const missingPermissions = requiredPermissions.filter(
      (permission) => !access.permissions.includes(permission),
    );

    const reason: string[] = [];
    if (missingRole) reason.push('MISSING_REQUIRED_ROLE');
    if (missingPermissions.length) reason.push('MISSING_REQUIRED_PERMISSIONS');

    return {
      ok: !missingRole && missingPermissions.length === 0,
      clerkUserId,
      source: 'database' as const,
      role: access.role,
      permissions: access.permissions,
      required: {
        role: requiredRole,
        permissions: requiredPermissions,
      },
      missing: {
        role: missingRole,
        permissions: missingPermissions,
      },
      reason,
    };
  }
}
