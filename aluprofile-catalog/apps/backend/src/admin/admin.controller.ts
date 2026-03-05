import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService, ProfileInput } from './admin.service';
import { AppPermission, AppRole, Status } from '../../node_modules/.prisma/client';
import {
  RequirePermissions,
} from '../auth/authz.decorators';

function toNumberArray(input: unknown): number[] {
  if (Array.isArray(input)) {
    return input.map((item) => Number(item)).filter((item) => !Number.isNaN(item));
  }
  if (typeof input === 'string' && input.trim()) {
    return input
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => !Number.isNaN(item));
  }
  return [];
}

function parseProfileBody(
  body: Record<string, unknown>,
  requireSupplier: boolean,
): ProfileInput {
  const supplierRaw = body.supplierId;
  const supplierId =
    supplierRaw === undefined || supplierRaw === null || supplierRaw === ''
      ? undefined
      : Number(supplierRaw);
  if (requireSupplier && (supplierId === undefined || Number.isNaN(supplierId))) {
    throw new BadRequestException('supplierId is required');
  }
  return {
    name: body.name ? String(body.name) : undefined,
    nameDe: body.nameDe ? String(body.nameDe) : undefined,
    description: body.description ? String(body.description) : undefined,
    descriptionDe: body.descriptionDe ? String(body.descriptionDe) : undefined,
    usage: body.usage ? String(body.usage) : undefined,
    usageDe: body.usageDe ? String(body.usageDe) : undefined,
    drawingUrl: body.drawingUrl ? String(body.drawingUrl) : undefined,
    photoUrl: body.photoUrl ? String(body.photoUrl) : undefined,
    logoUrl: body.logoUrl ? String(body.logoUrl) : undefined,
    dimensions: body.dimensions ? String(body.dimensions) : undefined,
    weightPerMeter: body.weightPerMeter
      ? Number(body.weightPerMeter)
      : undefined,
    material: body.material ? String(body.material) : undefined,
    materialDe: body.materialDe ? String(body.materialDe) : undefined,
    lengthMm: body.lengthMm ? Number(body.lengthMm) : undefined,
    status: body.status ? (String(body.status) as Status) : undefined,
    supplierId,
    applicationIds: toNumberArray(body.applicationIds),
    crossSectionIds: toNumberArray(body.crossSectionIds),
  };
}

@Controller('admin')
@UseGuards(AdminGuard)
@RequirePermissions(AppPermission.VIEW_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('reference-data')
  getReferenceData() {
    return this.adminService.getReferenceData();
  }

  @Get('user-access')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  listUserAccess() {
    return this.adminService.listUserAccess();
  }

  @Post('user-access')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  upsertUserAccess(
    @Body()
    body: {
      clerkUserId: string;
      role: AppRole;
      permissions: AppPermission[];
    },
  ) {
    if (!body.clerkUserId?.trim()) {
      throw new BadRequestException('clerkUserId is required');
    }
    return this.adminService.upsertUserAccess({
      clerkUserId: body.clerkUserId.trim(),
      role: body.role,
      permissions: body.permissions ?? [],
    });
  }

  @Delete('user-access/:clerkUserId')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  deleteUserAccess(@Param('clerkUserId') clerkUserId: string) {
    if (!clerkUserId?.trim()) {
      throw new BadRequestException('clerkUserId is required');
    }
    return this.adminService.deleteUserAccess(clerkUserId.trim());
  }

  @Get('clerk-users')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  listClerkUsers(@Query('query') query?: string) {
    return this.adminService.listClerkUsers(query);
  }

  @Post('clerk-users')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  createClerkUser(
    @Body()
    body: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      username?: string;
    },
  ) {
    return this.adminService.createClerkUser(body);
  }

  @Put('clerk-users/:userId')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  updateClerkUser(
    @Param('userId') userId: string,
    @Body()
    body: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
    },
  ) {
    if (!userId?.trim()) {
      throw new BadRequestException('userId is required');
    }
    return this.adminService.updateClerkUser(userId.trim(), body);
  }

  @Delete('clerk-users/:userId')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  deleteClerkUser(@Param('userId') userId: string) {
    if (!userId?.trim()) {
      throw new BadRequestException('userId is required');
    }
    return this.adminService.deleteClerkUser(userId.trim());
  }

  @Get('suppliers')
  @RequirePermissions(AppPermission.SUPPLIERS_MANAGE)
  listSuppliers() {
    return this.adminService.listSuppliers();
  }

  @Post('suppliers')
  @RequirePermissions(AppPermission.SUPPLIERS_MANAGE)
  createSupplier(
    @Body()
    body: {
      name: string;
      nameDe?: string;
      address?: string;
      contactPerson?: string;
      email?: string;
      phone?: string;
      website?: string;
    },
  ) {
    return this.adminService.createSupplier(body);
  }

  @Put('suppliers/:id')
  @RequirePermissions(AppPermission.SUPPLIERS_MANAGE)
  updateSupplier(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      nameDe?: string;
      address?: string;
      contactPerson?: string;
      email?: string;
      phone?: string;
      website?: string;
    },
  ) {
    return this.adminService.updateSupplier(id, body);
  }

  @Delete('suppliers/:id')
  @RequirePermissions(AppPermission.SUPPLIERS_MANAGE)
  deleteSupplier(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteSupplier(id);
  }

  @Get('applications')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  listApplications() {
    return this.adminService.listApplications();
  }

  @Post('applications')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  createApplication(@Body() body: { name: string; nameDe?: string }) {
    return this.adminService.createApplication({
      name: body.name,
      nameDe: body.nameDe,
    });
  }

  @Put('applications/:id')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  updateApplication(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string; nameDe?: string },
  ) {
    return this.adminService.updateApplication(id, {
      name: body.name,
      nameDe: body.nameDe,
    });
  }

  @Delete('applications/:id')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  deleteApplication(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteApplication(id);
  }

  @Get('cross-sections')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  listCrossSections() {
    return this.adminService.listCrossSections();
  }

  @Post('cross-sections')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  createCrossSection(@Body() body: { name: string; nameDe?: string }) {
    return this.adminService.createCrossSection({
      name: body.name,
      nameDe: body.nameDe,
    });
  }

  @Put('cross-sections/:id')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  updateCrossSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string; nameDe?: string },
  ) {
    return this.adminService.updateCrossSection(id, {
      name: body.name,
      nameDe: body.nameDe,
    });
  }

  @Delete('cross-sections/:id')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  deleteCrossSection(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCrossSection(id);
  }

  @Get('profiles')
  @RequirePermissions(AppPermission.PROFILES_MANAGE)
  listProfiles() {
    return this.adminService.listProfiles();
  }

  @Post('profiles')
  @RequirePermissions(AppPermission.PROFILES_MANAGE)
  createProfile(@Body() body: Record<string, unknown>) {
    return this.adminService.createProfile(parseProfileBody(body, true));
  }

  @Put('profiles/:id')
  @RequirePermissions(AppPermission.PROFILES_MANAGE)
  updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.adminService.updateProfile(id, parseProfileBody(body, false));
  }

  @Delete('profiles/:id')
  @RequirePermissions(AppPermission.PROFILES_MANAGE)
  deleteProfile(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteProfile(id);
  }

  @Post('uploads')
  @RequirePermissions(AppPermission.PROFILES_MANAGE)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname || '');
          callback(null, `${Date.now()}-${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, callback) => {
        const allowed = /image\/|application\/pdf/.test(file.mimetype);
        callback(null, allowed);
      },
      limits: {
        fileSize: 12 * 1024 * 1024,
      },
    }),
  )
  uploadFile(@UploadedFile() file: any, @Req() req: Request) {
    if (!file?.filename) {
      throw new BadRequestException('No valid file uploaded');
    }
    const host = `${req.protocol}://${req.get('host')}`;
    return {
      url: `${host}/uploads/${file.filename}`,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  @Post('demo-data/seed')
  @RequirePermissions(AppPermission.PROFILES_MANAGE)
  seedDemoData() {
    return this.adminService.seedDemoData();
  }
}