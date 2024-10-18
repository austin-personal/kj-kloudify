import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()  // 루트 경로
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()  // '/' 경로로 요청을 처리
  getData(): string {
    return 'Hello from NestJS!';
  }
  @Get('data')
  getPark() {
    return { message: 'PArk Insung!' };
  }
}
