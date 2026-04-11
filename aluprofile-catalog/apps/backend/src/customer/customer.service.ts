import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status } from '../../node_modules/.prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileInput } from '../admin/admin.service';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  getReferenceData() {
    return Promise.all([
      this.prisma.supplier.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.application.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.crossSection.findMany({ orderBy: { name: 'asc' } }),
    ]).then(([suppliers, applications, crossSections]) => ({
      suppliers,
      applications,
      crossSections,
      statusOptions: Object.values(Status),
    }));
  }

  listProfiles(clerkUserId: string) {
    return this.prisma.profile.findMany({
      where: { ownerClerkUserId: clerkUserId },
      orderBy: { updatedAt: 'desc' },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
      },
    });
  }

  async createProfile(clerkUserId: string, input: ProfileInput) {
    if (!input.name || !input.supplierId) {
      throw new BadRequestException('name and supplierId are required');
    }

    return this.prisma.profile.create({
      data: {
        ownerClerkUserId: clerkUserId,
        name: input.name,
        nameDe: input.nameDe,
        description: input.description,
        descriptionDe: input.descriptionDe,
        usage: input.usage,
        usageDe: input.usageDe,
        drawingUrl: input.drawingUrl,
        photoUrl: input.photoUrl,
        logoUrl: input.logoUrl,
        dimensions: input.dimensions,
        weightPerMeter: input.weightPerMeter,
        material: input.material,
        materialDe: input.materialDe,
        lengthMm: input.lengthMm,
        status: input.status ?? Status.AVAILABLE,
        supplier: { connect: { id: input.supplierId } },
        applications: {
          connect: (input.applicationIds ?? []).map((id) => ({ id })),
        },
        crossSections: {
          connect: (input.crossSectionIds ?? []).map((id) => ({ id })),
        },
      },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
      },
    });
  }

  async updateProfile(clerkUserId: string, id: number, input: Partial<ProfileInput>) {
    const existing = await this.prisma.profile.findFirst({
      where: { id, ownerClerkUserId: clerkUserId },
    });
    if (!existing) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { id },
      data: {
        name: input.name,
        nameDe: input.nameDe,
        description: input.description,
        descriptionDe: input.descriptionDe,
        usage: input.usage,
        usageDe: input.usageDe,
        drawingUrl: input.drawingUrl,
        photoUrl: input.photoUrl,
        logoUrl: input.logoUrl,
        dimensions: input.dimensions,
        weightPerMeter: input.weightPerMeter,
        material: input.material,
        materialDe: input.materialDe,
        lengthMm: input.lengthMm,
        status: input.status,
        supplier: input.supplierId ? { connect: { id: input.supplierId } } : undefined,
        applications: input.applicationIds
          ? { set: input.applicationIds.map((appId) => ({ id: appId })) }
          : undefined,
        crossSections: input.crossSectionIds
          ? { set: input.crossSectionIds.map((crossId) => ({ id: crossId })) }
          : undefined,
      },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
      },
    });
  }

  async deleteProfile(clerkUserId: string, id: number) {
    const existing = await this.prisma.profile.findFirst({
      where: { id, ownerClerkUserId: clerkUserId },
    });
    if (!existing) {
      throw new NotFoundException('Profile not found');
    }

    await this.prisma.profile.delete({ where: { id } });
    return { ok: true, id };
  }
}
