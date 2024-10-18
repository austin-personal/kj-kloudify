import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // 사용자 검증 로직 (예시로 간단한 아이디/비밀번호 검증)
  async validateUser(username: string, pass: string): Promise<any> {
    const admin_id = '1234';
    const admin_pw = 'qwer';

    if (username === admin_id && pass === admin_pw) {
      return { username };  // 검증이 성공한 경우 사용자 정보 리턴
    }
    return null;  // 검증 실패 시 null 리턴
  }

  // 로그인 시 JWT 토큰 생성
  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };  // JWT payload
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1d' }),  // 토큰 유효 기간 1일 설정
    };
  }
}
