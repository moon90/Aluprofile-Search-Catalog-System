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
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';
import { Status } from '../../node_modules/.prisma/client';
import { CustomerGuard } from '../auth/customer.guard';
import { CustomerAuthContext } from '../auth/auth.types';
import { ProfileInput } from '../admin/admin.service';
import { CustomerService } from './customer.service';

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

function parseProfileBody(body: Record<string, unknown>, requireSupplier: boolean): ProfileInput {
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
    weightPerMeter: body.weightPerMeter ? Number(body.weightPerMeter) : undefined,
    material: body.material ? String(body.material) : undefined,
    materialDe: body.materialDe ? String(body.materialDe) : undefined,
    lengthMm: body.lengthMm ? Number(body.lengthMm) : undefined,
    status: body.status ? (String(body.status) as Status) : undefined,
    supplierId,
    applicationIds: toNumberArray(body.applicationIds),
    crossSectionIds: toNumberArray(body.crossSectionIds),
  };
}

@Controller('customer')
@UseGuards(CustomerGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('reference-data')
  getReferenceData() {
    return this.customerService.getReferenceData();
  }

  @Get('profiles')
  listProfiles(@Req() req: Request & { customerAuth?: CustomerAuthContext }) {
    return this.customerService.listProfiles(req.customerAuth!.clerkUserId);
  }

  @Post('profiles')
  createProfile(
    @Req() req: Request & { customerAuth?: CustomerAuthContext },
    @Body() body: Record<string, unknown>,
  ) {
    return this.customerService.createProfile(
      req.customerAuth!.clerkUserId,
      parseProfileBody(body, true),
    );
  }

  @Put('profiles/:id')
  updateProfile(
    @Req() req: Request & { customerAuth?: CustomerAuthContext },
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.customerService.updateProfile(
      req.customerAuth!.clerkUserId,
      id,
      parseProfileBody(body, false),
    );
  }

  @Delete('profiles/:id')
  deleteProfile(
    @Req() req: Request & { customerAuth?: CustomerAuthContext },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.customerService.deleteProfile(req.customerAuth!.clerkUserId, id);
  }

  @Post('uploads')
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
      limits: { fileSize: 12 * 1024 * 1024 },
    }),
  )
  uploadFile(
    @UploadedFile() file: any,
    @Req() req: Request,
  ) {
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
}
