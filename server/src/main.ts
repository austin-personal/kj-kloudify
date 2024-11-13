import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:80', // React 클라이언트의 도메인
    credentials: true, // 쿠키 전송 허용
  });  // CORS 활성화
  await app.listen(3000,'0.0.0.0');
}
bootstrap();
