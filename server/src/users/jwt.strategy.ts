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

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findOne(payload.username);
    if (!user) {
      throw new UnauthorizedException();  // 유저가 존재하지 않으면 예외 발생
    }
    return { userId: user.id, username: user.username };
  }
}
