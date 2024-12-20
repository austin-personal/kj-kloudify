import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { UsersService } from './users.service';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Bearer 토큰으로부터 JWT 추출
      ignoreExpiration: false,
      secretOrKey: 'I\'M IML',  // 비밀 키 설정
    });
  }
  // 페이로드에서 이메일을 추출해서 
  async validate(payload: JwtPayload) {
    const user = await this.usersService.findOneByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {  email: user.email };  // JWT에서 이메일 또는 유저 ID 반환
  }
}
