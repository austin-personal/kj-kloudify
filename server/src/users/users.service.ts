import { Payload } from './../../node_modules/aws-sdk/clients/athena.d';
import { Injectable, UnauthorizedException , NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entity/users.entity';  // User 가져오기
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,  // TypeORM Repository 주입
    private readonly jwtService: JwtService,
  ) {}

  async findOne(username: string): Promise<Users | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  // 새 사용자 생성
  async createUser(username: string, password: string, email: string): Promise<Users> {
    const hashedPassword = await bcrypt.hash(password, 10);  // 비밀번호 해시
    const newUser = this.usersRepository.create({
      username,
      password: hashedPassword,
      email,
    });
    
    try {
      const newUser = this.usersRepository.create({
        username,
        password: hashedPassword,
        email,
      });

      console.log(newUser);
      return await this.usersRepository.save(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }


  // 로그인 
  async login(user: Omit<Users, 'password'>): Promise<{ access_token: string }> {
    // JWT 토큰에 사용할 재료... 현재는 이메일 이메일
    const payload = { email: user.email, sub: user.email };  // JWT 페이로드에 이메일 사용
    console.log("user login: ", payload);
    
    return {
      access_token: this.jwtService.sign(payload),  // JWT 발급
    };
  }

  async validateUser(email: string, password: string): Promise<Omit<Users, 'password'>> {
    console.log(email, password);
    
    const user = await this.findOneByEmail(email);
    console.log("USER : ",user);
    if (!user) {
      throw new UnauthorizedException('해당 사용자가 존재하지 않습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    const { password: userPassword, ...result } = user;
    return result;
  }

  // 이메일을 기준으로 사용자 찾기
  async findOneByEmail(email: string): Promise<Users> {
    const user = await this.usersRepository.findOne({ where: {email} });
    if (!user) {
      throw new NotFoundException('User not found');  // 사용자가 없으면 예외 발생
    }
    return user;
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token); // JWT 토큰 검증
    } catch (error) {
      return null; // 검증 실패 시 null 반환
    }
  }

}
