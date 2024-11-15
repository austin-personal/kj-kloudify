import { Email } from './../../node_modules/aws-sdk/clients/finspacedata.d';
import { Controller, Post, Patch, Body, UseGuards, Req, UnauthorizedException , Get, BadRequestException , Res } from '@nestjs/common'; // UseGuards, Req 추가
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';  // LoginDto 추가
import { JwtAuthGuard } from './jwt-auth.guard';  // auth에서 옮겨진 guard 사용
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from './current-user.decorator';
import { NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt'; // JwtService 임포트

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

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
      maxAge: 10800000, // 1시간
    });

    // 응답 전송
    (res as Response).send({ message: '로그인 성공' });
  }


  // JWT 토큰에서 사용자 이메일을 추출하여 정보 조회
  // @UseGuards(JwtAuthGuard)  // JWT 인증 가드 적용
  @Get('info')
  async getUserInfo(@Req() req: Request) {
    const token = req.cookies?.token; // 쿠키에서 JWT 추출

    if (!token) {
      throw new UnauthorizedException('No token found in cookies');
    }

    // JWT 토큰 디코딩
    let decoded;
    try {
      decoded = this.jwtService.verify(token); // 토큰 검증 및 디코딩
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    const email = decoded.email; // 디코딩된 토큰에서 이메일 추출

    if (!email) {
      throw new NotFoundException('Email is missing in token');
    }

    // 이메일로 사용자 조회
    const userInfo = await this.usersService.findOneByEmail(email);

    // userInfo가 null인 경우 처리
    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    return {
      message: `${userInfo.username}님의 정보 조회가 완료되었습니다.`,
      user: userInfo,
    };
  }
  
  @Get('check-auth')
  async checkAuth(@Req() req: Request, @Res() res: Response): Promise<void> {
    const token = req.cookies?.token; // HttpOnly 쿠키에서 JWT 토큰 확인

    if (!token) {
      res.status(401).json({ isAuthenticated: false, message: '토큰이 없습니다.' });
      return;
    }

    try {
      const decoded = this.usersService.verifyToken(token); // JWT 토큰 검증
      if (decoded) {
        res.status(200).json({ isAuthenticated: true });
      } else {
        res.status(401).json({ isAuthenticated: false });
      }
      return;
    } catch (error) {
      console.error('토큰 검증 오류:', error);
      res.status(401).json({ isAuthenticated: false, message: '토큰이 유효하지 않습니다.' });
      return;
    }
  }

}

