import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entity/users.entity';  // UserEntity 가져오기
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,  // TypeORM Repository 주입
    private readonly jwtService: JwtService,
  ) {}

  async findOne(username: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async createUser(username: string, password: string, email: string): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(password, 10);  // 비밀번호 해시
    const newUser = this.usersRepository.create({
      username,
      password: hashedPassword,
      email,
    });
    return this.usersRepository.save(newUser);  // DB에 저장
  }

  async login(user: Omit<UserEntity, 'password'>): Promise<{ access_token: string }> {
    const payload = { username: user.username, sub: user.id };  // JWT 페이로드
    return {
      access_token: this.jwtService.sign(payload),  // JWT 발급
    };
  }

  async validateUser(username: string, password: string): Promise<Omit<UserEntity, 'password'>> {
    const user = await this.findOne(username);
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
}
