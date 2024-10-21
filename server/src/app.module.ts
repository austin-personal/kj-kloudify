import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { TerraformsModule } from './terraforms/terraform.module';

@Module({
  imports: [UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',  // MySQL에서 PostgreSQL로 변경
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),  // 기본 포트를 명시적으로 설정
      username: process.env.DATABASE_USER || 'postgres',  // PostgreSQL의 기본 사용자 이름은 'postgres'
      password: process.env.DATABASE_PASSWORD || '1234',
      database: process.env.DATABASE_NAME || 'my_test',
      entities: [__dirname + '/users/entity/*.entity{.ts,.js}'],
      synchronize: true,  // 개발 환경에서는 true로 설정
    }),
    TerraformsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
