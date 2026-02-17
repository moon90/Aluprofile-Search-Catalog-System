import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AdminGuard } from './admin.guard';

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(AdminGuard)
  getMe(@Req() req: Request & { auth?: unknown }) {
    return { ok: true, auth: req.auth ?? null };
  }
}
