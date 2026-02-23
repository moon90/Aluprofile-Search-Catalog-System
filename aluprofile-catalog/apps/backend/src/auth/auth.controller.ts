import { Controller, Get, Headers, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AdminGuard } from './admin.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AdminGuard)
  getMe(@Req() req: Request & { auth?: unknown }) {
    return { ok: true, auth: req.auth ?? null };
  }

  @Get('access-check')
  async getAccessCheck(@Headers('authorization') authorization?: string) {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : '';
    const check = await this.authService.getAccessCheck(token);
    return { ok: true, check };
  }
}