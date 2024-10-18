import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Bearer 토큰으로부터 JWT 추출
      ignoreExpiration: false,
      secretOrKey: 'I\'M IML',  // 비밀 키 설정
    });
  }

  async validate(payload: JwtPayload) {
    // JWT의 payload에 있는 정보를 검증 후 리턴 (사용자 ID나 정보)
    return { userId: payload.sub, username: payload.username };
  }
}
