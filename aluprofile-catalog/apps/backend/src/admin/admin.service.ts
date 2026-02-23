import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClerkClient } from '@clerk/backend';
import { AppPermission, AppRole, Status } from '../../node_modules/.prisma/client';

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

  private get clerkSecretKey() {
    const value = process.env.CLERK_SECRET_KEY;
    if (!value) {
      throw new InternalServerErrorException('CLERK_SECRET_KEY is not configured');
    }
    return value;
  }

  private get clerkClient() {
    return createClerkClient({ secretKey: this.clerkSecretKey });
  }

  private mapClerkUser(user: any) {
    return {
      id: user.id,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      username: user.username ?? '',
      banned: Boolean(user.banned),
      locked: Boolean(user.locked),
      imageUrl: user.imageUrl ?? '',
      createdAt: user.createdAt ?? null,
      updatedAt: user.updatedAt ?? null,
      lastSignInAt: user.lastSignInAt ?? null,
      emailAddresses: (user.emailAddresses ?? []).map((item: any) => ({
        id: item.id,
        emailAddress: item.emailAddress,
        verificationStatus: item.verification?.status ?? null,
      })),
      primaryEmailAddressId: user.primaryEmailAddressId ?? null,
      primaryEmailAddress:
        (user.emailAddresses ?? []).find((item: any) => item.id === user.primaryEmailAddressId)
          ?.emailAddress ?? null,
    };
  }

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

  async listClerkUsers(query?: string) {
    const result = await this.clerkClient.users.getUserList({
      limit: 100,
      orderBy: '-created_at',
      query: query?.trim() || undefined,
    });
    return result.data.map((user) => this.mapClerkUser(user));
  }

  async createClerkUser(input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }) {
    const email = input.email?.trim();
    const password = input.password?.trim();
    if (!email) {
      throw new BadRequestException('email is required');
    }
    if (!password || password.length < 8) {
      throw new BadRequestException('password must be at least 8 characters');
    }

    const created = await this.clerkClient.users.createUser({
      emailAddress: [email],
      password,
      firstName: input.firstName?.trim() || undefined,
      lastName: input.lastName?.trim() || undefined,
      username: input.username?.trim() || undefined,
    });

    return this.mapClerkUser(created);
  }

  async updateClerkUser(
    userId: string,
    input: {
      password?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
    },
  ) {
    const payload: Record<string, unknown> = {
      firstName: input.firstName?.trim() || undefined,
      lastName: input.lastName?.trim() || undefined,
      username: input.username?.trim() || undefined,
    };

    const password = input.password?.trim();
    if (password) {
      if (password.length < 8) {
        throw new BadRequestException('password must be at least 8 characters');
      }
      payload.password = password;
    }

    const updated = await this.clerkClient.users.updateUser(userId, payload);
    return this.mapClerkUser(updated);
  }

  async deleteClerkUser(userId: string) {
    const deleted = await this.clerkClient.users.deleteUser(userId);
    await this.prisma.userAccess.deleteMany({ where: { clerkUserId: userId } });
    return {
      ok: true,
      userId,
      deleted: this.mapClerkUser(deleted),
    };
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

  async seedDemoData() {
    const suppliers = await Promise.all([
      this.prisma.supplier.upsert({
        where: { name: 'Aluzone GmbH' },
        update: {
          address: 'Grosse Stadtgutgasse 29/12, A-1020 Wien',
          contactPerson: 'Oliver Kascha',
          phone: '+43 699 122 35 850',
          email: 'office@aluzone.example',
          website: 'https://aluprofile.biz',
        },
        create: {
          name: 'Aluzone GmbH',
          address: 'Grosse Stadtgutgasse 29/12, A-1020 Wien',
          contactPerson: 'Oliver Kascha',
          phone: '+43 699 122 35 850',
          email: 'office@aluzone.example',
          website: 'https://aluprofile.biz',
        },
      }),
      this.prisma.supplier.upsert({
        where: { name: 'Tepro Tec' },
        update: {
          contactPerson: 'Sales Team',
          phone: '+43 676 123 4567',
          website: 'https://tepro.example',
        },
        create: {
          name: 'Tepro Tec',
          contactPerson: 'Sales Team',
          phone: '+43 676 123 4567',
          website: 'https://tepro.example',
        },
      }),
      this.prisma.supplier.upsert({
        where: { name: 'DasaTech' },
        update: {
          contactPerson: 'Operations Desk',
          phone: '+43 678 590 9989',
          website: 'https://dasatech.example',
        },
        create: {
          name: 'DasaTech',
          contactPerson: 'Operations Desk',
          phone: '+43 678 590 9989',
          website: 'https://dasatech.example',
        },
      }),
    ]);

    const applications = await Promise.all([
      this.prisma.application.upsert({
        where: { name: 'Maschinenbau' },
        update: {},
        create: { name: 'Maschinenbau' },
      }),
      this.prisma.application.upsert({
        where: { name: 'Solaranlagen' },
        update: {},
        create: { name: 'Solaranlagen' },
      }),
      this.prisma.application.upsert({
        where: { name: 'Transportkiste' },
        update: {},
        create: { name: 'Transportkiste' },
      }),
    ]);

    const crossSections = await Promise.all([
      this.prisma.crossSection.upsert({
        where: { name: '40x40 Leicht' },
        update: {},
        create: { name: '40x40 Leicht' },
      }),
      this.prisma.crossSection.upsert({
        where: { name: 'U-Profil 40x20x40' },
        update: {},
        create: { name: 'U-Profil 40x20x40' },
      }),
      this.prisma.crossSection.upsert({
        where: { name: 'Trennwandsystem 9.5x26x5.8' },
        update: {},
        create: { name: 'Trennwandsystem 9.5x26x5.8' },
      }),
    ]);

    const profileSeed = [
      {
        name: 'B40 Sonderprofil',
        description: '40x40mm modular profile for machine frames.',
        usage: 'Maschinenbauteil',
        dimensions: '40x40mm',
        weightPerMeter: 1.74,
        material: 'Al Mg Si 0.5',
        lengthMm: 6000,
        drawingUrl: 'https://dummyimage.com/640x360/e9f2f2/19474f.png&text=B40+Drawing',
        photoUrl: 'https://dummyimage.com/640x360/dbe7ea/19474f.png&text=B40+Usage+Photo',
        logoUrl: 'https://dummyimage.com/220x220/f0f5f5/19474f.png&text=Aluzone',
        status: Status.AVAILABLE,
        supplierId: suppliers[0].id,
        applicationIds: [applications[0].id],
        crossSectionIds: [crossSections[0].id],
      },
      {
        name: 'X-Profil Transport',
        description: 'Rigid profile for flightcase and transport constructions.',
        usage: 'X-Profil Transportkiste',
        dimensions: '40x40mm',
        weightPerMeter: 0.67,
        material: 'Aluminium',
        lengthMm: 5800,
        drawingUrl: 'https://dummyimage.com/640x360/e6edf0/1e3a47.png&text=X-Profil+Drawing',
        photoUrl: 'https://dummyimage.com/640x360/d9e5eb/1e3a47.png&text=Flightcase+Usage',
        logoUrl: 'https://dummyimage.com/220x220/f2f6f8/1e3a47.png&text=Tepro+Tec',
        status: Status.IN_DEVELOPMENT,
        supplierId: suppliers[1].id,
        applicationIds: [applications[2].id],
        crossSectionIds: [crossSections[1].id],
      },
      {
        name: 'Trenner 9.5x26x5.8',
        description: 'Partition profile for lightweight interior systems.',
        usage: 'Trennwandsystem',
        dimensions: '9.5x26x5.8',
        weightPerMeter: 0.31,
        material: 'Aluminium',
        lengthMm: 4000,
        drawingUrl: 'https://dummyimage.com/640x360/e9eeea/2a5a3f.png&text=Trennwand+Drawing',
        photoUrl: 'https://dummyimage.com/640x360/dfe9e2/2a5a3f.png&text=Partition+Usage',
        logoUrl: 'https://dummyimage.com/220x220/f1f6f3/2a5a3f.png&text=DasaTech',
        status: Status.AVAILABLE,
        supplierId: suppliers[2].id,
        applicationIds: [applications[1].id],
        crossSectionIds: [crossSections[2].id],
      },
    ];

    for (const item of profileSeed) {
      await this.prisma.profile.upsert({
        where: { name: item.name },
        update: {
          description: item.description,
          usage: item.usage,
          dimensions: item.dimensions,
          weightPerMeter: item.weightPerMeter,
          material: item.material,
          lengthMm: item.lengthMm,
          drawingUrl: item.drawingUrl,
          photoUrl: item.photoUrl,
          logoUrl: item.logoUrl,
          status: item.status,
          supplier: { connect: { id: item.supplierId } },
          applications: {
            set: item.applicationIds.map((id) => ({ id })),
          },
          crossSections: {
            set: item.crossSectionIds.map((id) => ({ id })),
          },
        },
        create: {
          name: item.name,
          description: item.description,
          usage: item.usage,
          dimensions: item.dimensions,
          weightPerMeter: item.weightPerMeter,
          material: item.material,
          lengthMm: item.lengthMm,
          drawingUrl: item.drawingUrl,
          photoUrl: item.photoUrl,
          logoUrl: item.logoUrl,
          status: item.status,
          supplier: { connect: { id: item.supplierId } },
          applications: {
            connect: item.applicationIds.map((id) => ({ id })),
          },
          crossSections: {
            connect: item.crossSectionIds.map((id) => ({ id })),
          },
        },
      });
    }

    const [profileCount, supplierCount, applicationCount, crossSectionCount] =
      await Promise.all([
        this.prisma.profile.count(),
        this.prisma.supplier.count(),
        this.prisma.application.count(),
        this.prisma.crossSection.count(),
      ]);

    return {
      message: 'Demo data seeded successfully',
      totals: {
        profiles: profileCount,
        suppliers: supplierCount,
        applications: applicationCount,
        crossSections: crossSectionCount,
      },
    };
  }
}