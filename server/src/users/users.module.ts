import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entity/users.entity'; // UserEntity 가져오기


@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),  // UserEntity 리포지토리 등록
    PassportModule,
    JwtModule.register({
      secret: 'I\'M IML',  // 비밀 키 설정
      signOptions: { expiresIn: '1d' },  // 토큰 유효 기간 1일
    }),
  ],
  providers: [UsersService, JwtStrategy, JwtAuthGuard],
  controllers: [UsersController],
  exports: [UsersService],  // UsersService를 다른 모듈에서 사용 가능하도록 export
})
export class UsersModule {}
