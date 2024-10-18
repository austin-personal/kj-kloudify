import { Controller, Post, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  // 로그인 엔드포인트
  @Post('login')
  async login(@Request() req) {
    const { id, pw } = req.body;  // 클라이언트로부터 ID와 비밀번호를 받음
    const user = await this.authService.validateUser(id, pw);  // 사용자 검증

    if (!user) {
      return { result: 'Invalid Params!' };  // 인증 실패 시 에러 메시지
    }

    return this.authService.login(user);  // JWT 토큰 생성
  }

  // JWT로 보호된 엔드포인트 (토큰이 있어야 접근 가능)
  @UseGuards(JwtAuthGuard)
  @Get('user_only')
  getProfile(@Request() req) {
    return { message: `Hi!, ${req.user.username}` };  // JWT에서 추출한 사용자 정보 리턴
  }
}
