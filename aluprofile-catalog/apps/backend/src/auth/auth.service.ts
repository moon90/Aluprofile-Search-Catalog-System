import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { AppPermission, AppRole } from '@prisma/client';
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

  async verify(token: string) {
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
}
