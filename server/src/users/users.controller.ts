import { Controller, Post, Patch, Body, UseGuards, Req, UnauthorizedException , Get} from '@nestjs/common'; // UseGuards, Req 추가
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';  // LoginDto 추가
import { JwtAuthGuard } from './jwt-auth.guard';  // auth에서 옮겨진 guard 사용
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from './current-user.decorator';
import { NotFoundException } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  // 회원가입 엔드포인트
  @Post('signUp')
  async signUp(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.findOne(createUserDto.username);
    if (user) {
      throw new UnauthorizedException('User already exists');
    }
    const newUser = await this.usersService.createUser(
      createUserDto.username,
      createUserDto.password,
      createUserDto.email
    );
    return this.usersService.login(newUser); // 회원가입 후 로그인
  }

  // 로그인 엔드포인트
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    console.log("user login: ", loginDto);
    const user = await this.usersService.validateUser(loginDto.email, loginDto.password);
    // validateUser 메서드에서 예외가 발생하지 않으면 user는 null이 될 수 없으므로 추가적인 null 체크 불필요
    return this.usersService.login(user);  // 비밀번호를 제외한 user 정보
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
