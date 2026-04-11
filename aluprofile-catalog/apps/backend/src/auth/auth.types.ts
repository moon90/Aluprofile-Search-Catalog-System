import { AppPermission, AppRole } from '../../node_modules/.prisma/client';

export type AuthContext = {
  clerkUserId: string;
  appRole: AppRole;
  appPermissions: AppPermission[];
  source: 'database' | 'bootstrap';
};

export type CustomerAuthContext = {
  clerkUserId: string;
};
