import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminGuard } from './admin.guard';
import { CustomerGuard } from './customer.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AdminGuard, CustomerGuard],
  exports: [AuthService, AdminGuard, CustomerGuard],
})
export class AuthModule {}
