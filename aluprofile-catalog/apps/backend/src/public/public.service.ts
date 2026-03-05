import { Injectable } from '@nestjs/common';
import { Prisma } from '../../node_modules/.prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type Lang = 'en' | 'de';

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

  private localizeText(lang: Lang, primary?: string | null, de?: string | null) {
    if (lang === 'de') {
      return de?.trim() ? de : primary;
    }
    return primary;
  }

  private localizeOption(lang: Lang, item: { id: number; name: string; nameDe?: string | null; _count?: { profiles: number } }) {
    return {
      id: item.id,
      name: this.localizeText(lang, item.name, item.nameDe),
      profilesCount: item._count?.profiles,
    };
  }

  private localizeProfile(lang: Lang, item: any) {
    return {
      ...item,
      name: this.localizeText(lang, item.name, item.nameDe),
      description: this.localizeText(lang, item.description, item.descriptionDe),
      usage: this.localizeText(lang, item.usage, item.usageDe),
      material: this.localizeText(lang, item.material, item.materialDe),
      supplier: item.supplier
        ? {
            ...item.supplier,
            name: this.localizeText(lang, item.supplier.name, item.supplier.nameDe),
          }
        : item.supplier,
      applications: (item.applications ?? []).map((app: any) => ({
        ...app,
        name: this.localizeText(lang, app.name, app.nameDe),
      })),
      crossSections: (item.crossSections ?? []).map((cross: any) => ({
        ...cross,
        name: this.localizeText(lang, cross.name, cross.nameDe),
      })),
    };
  }

  async getOverview(lang: Lang) {
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
          include: { supplier: true, applications: true, crossSections: true },
        }),
        this.prisma.$queryRaw<{ count: number }[]>(
          Prisma.sql`SELECT COUNT(*)::int AS count FROM "Profile"`,
        ),
      ]);

    return {
      totals: {
        profiles: rawProfileCount[0]?.count ?? 0,
      },
      applications: applications.map((item) => this.localizeOption(lang, item)),
      crossSections: crossSections.map((item) => this.localizeOption(lang, item)),
      newestProfiles: newestProfiles.map((item) => this.localizeProfile(lang, item)),
    };
  }

  async getProfiles(filters: ProfileFilters, lang: Lang) {
    const where: any = {};
    const and: any[] = [];

    if (filters.q) {
      and.push({
        OR: [
          { name: { contains: filters.q, mode: 'insensitive' } },
          { nameDe: { contains: filters.q, mode: 'insensitive' } },
          { description: { contains: filters.q, mode: 'insensitive' } },
          { descriptionDe: { contains: filters.q, mode: 'insensitive' } },
          { usage: { contains: filters.q, mode: 'insensitive' } },
          { usageDe: { contains: filters.q, mode: 'insensitive' } },
        ],
      });
    }
    if (filters.applicationId) {
      and.push({ applications: { some: { id: filters.applicationId } } });
    }
    if (filters.crossSectionId) {
      and.push({ crossSections: { some: { id: filters.crossSectionId } } });
    }
    if (filters.supplierId) {
      and.push({ supplierId: filters.supplierId });
    }
    if (filters.material) {
      and.push({
        OR: [
          { material: { contains: filters.material, mode: 'insensitive' } },
          { materialDe: { contains: filters.material, mode: 'insensitive' } },
        ],
      });
    }
    if (filters.dimensions) {
      and.push({ dimensions: { contains: filters.dimensions, mode: 'insensitive' } });
    }
    if (and.length > 0) {
      where.AND = and;
    }

    const profiles = await this.prisma.profile.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
      },
    });

    return profiles.map((item) => this.localizeProfile(lang, item));
  }

  async getProfileById(id: number, lang: Lang) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
      },
    });

    if (!profile) return null;
    return this.localizeProfile(lang, profile);
  }
}
