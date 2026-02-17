import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      ok: true,
      service: 'aluprofile-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
