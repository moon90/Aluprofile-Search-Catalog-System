import { AppPermission, AppRole } from '@prisma/client';

export type AuthContext = {
  clerkUserId: string;
  appRole: AppRole;
  appPermissions: AppPermission[];
  source: 'database' | 'bootstrap';
};

