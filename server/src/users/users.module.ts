import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'I\'M IML',  // 비밀 키 설정
      signOptions: { expiresIn: '1d' },  // 토큰 유효 기간 1일
    }),
  ],
  providers: [UsersService, JwtStrategy, JwtAuthGuard],
  controllers: [UsersController]
})
export class UsersModule {}
