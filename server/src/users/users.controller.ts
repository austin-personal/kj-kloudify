import { Email } from './../../node_modules/aws-sdk/clients/finspacedata.d';
import { Controller, Post, Patch, Body, UseGuards, Req, UnauthorizedException , Get, BadRequestException , Res } from '@nestjs/common'; // UseGuards, Req 추가
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';  // LoginDto 추가
import { JwtAuthGuard } from './jwt-auth.guard';  // auth에서 옮겨진 guard 사용
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from './current-user.decorator';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // // 회원가입 엔드포인트
  // @Post('signUp')
  // async signUp(@Body() createUserDto: CreateUserDto): Promise<{ achieved : boolean }> {
  //   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  //   const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

  //   // 이메일 유효성 검사
  //   if (!emailRegex.test(createUserDto.email)) {
  //     throw new BadRequestException('Invalid email format');
  //   }

  //   // 비밀번호 유효성 검사
  //   if (!passwordRegex.test(createUserDto.password)) {
  //     throw new BadRequestException('Password must be 8-20 characters long, with uppercase, lowercase, number, and special character');
  //   }

  //   const newUser = await this.usersService.createUser(
  //     createUserDto.username,
  //     createUserDto.password,
  //     createUserDto.email
  //   );
  //   return { achieved : !!newUser };
  // }

  // // 이메일 중복 체크  API
  // @Post('check-email')
  // async checkEmail(@Body('email') email: string): Promise<{ exists: boolean }> {
  //   const user = await this.usersService.findOne(email);
  //   return { exists: !!user }; // 사용자가 있으면 true, 없으면 false 반환
  // }


  // 로그인 엔드포인트
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<void> {
    console.log("user login: ", loginDto);

    // 사용자 인증
    const user = await this.usersService.validateUser(loginDto.email, loginDto.password);

    // JWT 토큰 생성
    const { access_token } = await this.usersService.login(user);

    // HTTP-only 쿠키 설정 (res를 express.Response로 인식)
    (res as Response).cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 배포 환경에서만 true
      sameSite: 'strict', // CSRF 방지 설정
      maxAge: 3600000, // 1시간
    });

    // 응답 전송
    (res as Response).send({ message: '로그인 성공' });
  }


  // JWT 토큰에서 사용자 이메일을 추출하여 정보 조회
  @Get('info')
  @UseGuards(JwtAuthGuard)  // JWT 인증 가드 적용
  async getUserInfo(@CurrentUser() user: any) {
    const email = user.email;  // JWT에서 이메일 추출
    const userInfo = await this.usersService.findOneByEmail(email);  // 이메일로 사용자 조회

    // userInfo가 null인 경우 처리
    if (!userInfo) {
      throw new NotFoundException('User not found');  // 사용자 정보가 없을 경우 예외 발생
    }

    return {
      message: `${userInfo.username}님의 정보 조회가 완료되었습니다.`,
      user: userInfo,
    };
  }

}
