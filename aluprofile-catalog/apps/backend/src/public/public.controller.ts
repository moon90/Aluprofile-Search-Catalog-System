import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('overview')
  getOverview() {
    return this.publicService.getOverview();
  }

  @Get('profiles')
  getProfiles(
    @Query('q') q?: string,
    @Query('applicationId') applicationId?: string,
    @Query('crossSectionId') crossSectionId?: string,
    @Query('supplierId') supplierId?: string,
    @Query('material') material?: string,
    @Query('dimensions') dimensions?: string,
  ) {
    return this.publicService.getProfiles({
      q,
      material,
      dimensions,
      applicationId: applicationId ? Number(applicationId) : undefined,
      crossSectionId: crossSectionId ? Number(crossSectionId) : undefined,
      supplierId: supplierId ? Number(supplierId) : undefined,
    });
  }

  @Get('profiles/:id')
  async getProfileById(@Param('id', ParseIntPipe) id: number) {
    const profile = await this.publicService.getProfileById(id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }
}
