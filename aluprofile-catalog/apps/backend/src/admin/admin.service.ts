import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppPermission, AppRole, Status } from '@prisma/client';

export type ProfileInput = {
  name?: string;
  description?: string;
  usage?: string;
  drawingUrl?: string;
  photoUrl?: string;
  logoUrl?: string;
  dimensions?: string;
  weightPerMeter?: number;
  material?: string;
  lengthMm?: number;
  status?: Status;
  supplierId?: number;
  applicationIds?: number[];
  crossSectionIds?: number[];
};

@Injectable()
export class AdminService {
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
      roleOptions: Object.values(AppRole),
      permissionOptions: Object.values(AppPermission),
    }));
  }

  listUserAccess() {
    return this.prisma.userAccess.findMany({
      orderBy: [{ role: 'asc' }, { clerkUserId: 'asc' }],
    });
  }

  upsertUserAccess(input: {
    clerkUserId: string;
    role: AppRole;
    permissions: AppPermission[];
  }) {
    return this.prisma.userAccess.upsert({
      where: { clerkUserId: input.clerkUserId },
      create: input,
      update: {
        role: input.role,
        permissions: input.permissions,
      },
    });
  }

  deleteUserAccess(clerkUserId: string) {
    return this.prisma.userAccess.delete({
      where: { clerkUserId },
    });
  }

  listSuppliers() {
    return this.prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { profiles: true } } },
    });
  }

  createSupplier(data: {
    name: string;
    address?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    website?: string;
  }) {
    return this.prisma.supplier.create({ data });
  }

  updateSupplier(
    id: number,
    data: Partial<{
      name: string;
      address?: string;
      contactPerson?: string;
      email?: string;
      phone?: string;
      website?: string;
    }>,
  ) {
    return this.prisma.supplier.update({ where: { id }, data });
  }

  deleteSupplier(id: number) {
    return this.prisma.supplier.delete({ where: { id } });
  }

  listApplications() {
    return this.prisma.application.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { profiles: true } } },
    });
  }

  createApplication(name: string) {
    return this.prisma.application.create({ data: { name } });
  }

  updateApplication(id: number, name: string) {
    return this.prisma.application.update({ where: { id }, data: { name } });
  }

  deleteApplication(id: number) {
    return this.prisma.application.delete({ where: { id } });
  }

  listCrossSections() {
    return this.prisma.crossSection.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { profiles: true } } },
    });
  }

  createCrossSection(name: string) {
    return this.prisma.crossSection.create({ data: { name } });
  }

  updateCrossSection(id: number, name: string) {
    return this.prisma.crossSection.update({ where: { id }, data: { name } });
  }

  deleteCrossSection(id: number) {
    return this.prisma.crossSection.delete({ where: { id } });
  }

  listProfiles() {
    return this.prisma.profile.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
      },
    });
  }

  async createProfile(input: ProfileInput) {
    if (!input.name || !input.supplierId) {
      throw new BadRequestException('name and supplierId are required');
    }
    return this.prisma.profile.create({
      data: {
        name: input.name,
        description: input.description,
        usage: input.usage,
        drawingUrl: input.drawingUrl,
        photoUrl: input.photoUrl,
        logoUrl: input.logoUrl,
        dimensions: input.dimensions,
        weightPerMeter: input.weightPerMeter,
        material: input.material,
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

  async updateProfile(id: number, input: Partial<ProfileInput>) {
    const existing = await this.prisma.profile.findUnique({
      where: { id },
      include: { applications: true, crossSections: true },
    });
    if (!existing) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        usage: input.usage,
        drawingUrl: input.drawingUrl,
        photoUrl: input.photoUrl,
        logoUrl: input.logoUrl,
        dimensions: input.dimensions,
        weightPerMeter: input.weightPerMeter,
        material: input.material,
        lengthMm: input.lengthMm,
        status: input.status,
        supplier: input.supplierId
          ? { connect: { id: input.supplierId } }
          : undefined,
        applications: input.applicationIds
          ? {
              set: input.applicationIds.map((appId) => ({ id: appId })),
            }
          : undefined,
        crossSections: input.crossSectionIds
          ? {
              set: input.crossSectionIds.map((crossId) => ({ id: crossId })),
            }
          : undefined,
      },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
      },
    });
  }

  deleteProfile(id: number) {
    return this.prisma.profile.delete({ where: { id } });
  }
}
