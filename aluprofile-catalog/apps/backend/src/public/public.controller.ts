import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PublicService } from './public.service';

type Lang = 'en' | 'de';

function normalizeLang(input?: string): Lang {
  return input?.toLowerCase() === 'de' ? 'de' : 'en';
}

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('overview')
  getOverview(@Query('lang') lang?: string) {
    return this.publicService.getOverview(normalizeLang(lang));
  }

  @Get('profiles')
  getProfiles(
    @Query('q') q?: string,
    @Query('applicationId') applicationId?: string,
    @Query('crossSectionId') crossSectionId?: string,
    @Query('supplierId') supplierId?: string,
    @Query('material') material?: string,
    @Query('dimensions') dimensions?: string,
    @Query('lang') lang?: string,
  ) {
    return this.publicService.getProfiles(
      {
        q,
        material,
        dimensions,
        applicationId: applicationId ? Number(applicationId) : undefined,
        crossSectionId: crossSectionId ? Number(crossSectionId) : undefined,
        supplierId: supplierId ? Number(supplierId) : undefined,
      },
      normalizeLang(lang),
    );
  }

  @Get('profiles/:id')
  async getProfileById(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ) {
    const profile = await this.publicService.getProfileById(id, normalizeLang(lang));
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }
}
