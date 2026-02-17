import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type ProfileFilters = {
  q?: string;
  applicationId?: number;
  crossSectionId?: number;
  supplierId?: number;
  material?: string;
  dimensions?: string;
};

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [applications, crossSections, newestProfiles, rawProfileCount] =
      await Promise.all([
        this.prisma.application.findMany({
          orderBy: { name: 'asc' },
          include: { _count: { select: { profiles: true } } },
        }),
        this.prisma.crossSection.findMany({
          orderBy: { name: 'asc' },
          include: { _count: { select: { profiles: true } } },
        }),
        this.prisma.profile.findMany({
          take: 8,
          orderBy: { createdAt: 'desc' },
          include: { supplier: true },
        }),
        this.prisma.$queryRaw<{ count: number }[]>(
          Prisma.sql`SELECT COUNT(*)::int AS count FROM "Profile"`,
        ),
      ]);

    return {
      totals: {
        profiles: rawProfileCount[0]?.count ?? 0,
      },
      applications: applications.map((item) => ({
        id: item.id,
        name: item.name,
        profilesCount: item._count.profiles,
      })),
      crossSections: crossSections.map((item) => ({
        id: item.id,
        name: item.name,
        profilesCount: item._count.profiles,
      })),
      newestProfiles,
    };
  }

  async getProfiles(filters: ProfileFilters) {
    const where: any = {};

    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
        { usage: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    if (filters.applicationId) {
      where.applications = { some: { id: filters.applicationId } };
    }
    if (filters.crossSectionId) {
      where.crossSections = { some: { id: filters.crossSectionId } };
    }
    if (filters.supplierId) {
      where.supplierId = filters.supplierId;
    }
    if (filters.material) {
      where.material = { contains: filters.material, mode: 'insensitive' };
    }
    if (filters.dimensions) {
      where.dimensions = { contains: filters.dimensions, mode: 'insensitive' };
    }

    return this.prisma.profile.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
      },
    });
  }

  async getProfileById(id: number) {
    return this.prisma.profile.findUnique({
      where: { id },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
      },
    });
  }
}
