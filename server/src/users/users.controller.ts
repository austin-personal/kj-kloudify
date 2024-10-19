import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';  // LoginDto 추가
import { JwtAuthGuard } from './jwt-auth.guard';  // auth에서 옮겨진 guard 사용

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.findOne(createUserDto.username);
    if (user) {
      throw new UnauthorizedException('User already exists');
    }
    const newUser = await this.usersService.createUser(createUserDto.username, createUserDto.password);
    return this.usersService.login(newUser); // 회원가입 후 로그인
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersService.validateUser(loginDto.username, loginDto.password);
    // validateUser 메서드에서 예외가 발생하지 않으면 user는 null이 될 수 없으므로 추가적인 null 체크 불필요
    return this.usersService.login(user);  // 비밀번호를 제외한 user 정보
  }
  
}
