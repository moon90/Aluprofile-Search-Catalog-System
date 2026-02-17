declare module '@prisma/client' {
  export type Status = 'AVAILABLE' | 'IN_DEVELOPMENT' | 'NOT_AVAILABLE';
  export type AppRole = 'ADMIN' | 'MANAGER' | 'USER';
  export type AppPermission =
    | 'VIEW_ADMIN'
    | 'PROFILES_MANAGE'
    | 'SUPPLIERS_MANAGE'
    | 'CATEGORIES_MANAGE'
    | 'USERS_MANAGE';

  export const Status: {
    AVAILABLE: Status;
    IN_DEVELOPMENT: Status;
    NOT_AVAILABLE: Status;
  };

  export const AppRole: {
    ADMIN: AppRole;
    MANAGER: AppRole;
    USER: AppRole;
  };

  export const AppPermission: {
    VIEW_ADMIN: AppPermission;
    PROFILES_MANAGE: AppPermission;
    SUPPLIERS_MANAGE: AppPermission;
    CATEGORIES_MANAGE: AppPermission;
    USERS_MANAGE: AppPermission;
  };

  export class PrismaClient {
    [key: string]: any;
    $connect(): Promise<void>;
    $on(event: string, listener: (...args: any[]) => void): void;
    $queryRaw<T = any>(...args: any[]): Promise<T>;
  }

  export const Prisma: {
    sql: (...parts: any[]) => any;
  };
}
