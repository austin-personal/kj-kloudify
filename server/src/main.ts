import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'; // cookie-parser 임포트

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 쿠키 파서 미들웨어 추가
  app.use(cookieParser());

  // CORS 설정
  app.enableCors({
    origin: 'http://localhost', // React 클라이언트의 도메인
    credentials: true, // 쿠키 전송 허용
  });

  await app.listen(3000, '0.0.0.0');
}

bootstrap();
