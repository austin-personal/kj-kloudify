import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'I\'M IML',  // 비밀 키 설정
      signOptions: { expiresIn: '1d' },  // 토큰 유효 기간 1일
    }),
  ],
  providers: [AuthService, JwtStrategy],  // AuthService 및 JwtStrategy 제공
  controllers: [AuthController],  // AuthController 설정
})
export class AuthModule {}
