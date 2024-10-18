import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],  // AppController가 등록되어 있는지 확인
  providers: [AppService],
})
export class AppModule {}
