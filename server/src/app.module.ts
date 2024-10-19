import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [UsersModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',  // 로컬 MySQL을 사용하도록 설정
      port: parseInt(process.env.DATABASE_PORT || '3306', 10),
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '1234',
      database: process.env.DATABASE_NAME || 'my_test',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
