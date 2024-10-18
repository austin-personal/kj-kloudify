import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors();

  await app.listen(process.env.PORT || 3000);
  console.log(`Nest application is running on: http://localhost:${process.env.PORT || 3000}`);
}
bootstrap();
