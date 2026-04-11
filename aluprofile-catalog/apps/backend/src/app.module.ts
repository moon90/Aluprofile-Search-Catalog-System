import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PublicModule } from './public/public.module';
import { AdminModule } from './admin/admin.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [PrismaModule, AuthModule, PublicModule, AdminModule, CustomerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
