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

  async findOne(userName: string): Promise<Users | null> {
    return this.usersRepository.findOne({ where: { userName } });
  }

  async createUser(userName: string, password: string, email: string): Promise<Users> {
    const hashedPassword = await bcrypt.hash(password, 10);  // 비밀번호 해시
    const newUser = this.usersRepository.create({
      userName,
      password: hashedPassword,
      email,
    });
    return this.usersRepository.save(newUser);  // DB에 저장
  }

  async login(user: Omit<Users, 'password'>): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user.email };  // JWT 페이로드에 이메일 사용
    return {
      access_token: this.jwtService.sign(payload),  // JWT 발급
    };
  }

  async validateUser(userName: string, password: string): Promise<Omit<Users, 'password'>> {
    const user = await this.findOne(userName);
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
  async findOneByEmail(email: string): Promise<Users | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');  // 사용자가 없으면 예외 발생
    }
    return user;
  }

  // 사용자 업데이트 메서드
  // async updateUserByEmail(email: string, updateUserDto: UpdateUserDto): Promise<User> {
  //   const user = await this.findOneByEmail(email);  // 현재 사용자 찾기
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   // 사용자 이름 중복 체크 (email은 업데이트하지 않으므로 생략)
  //   if (updateUserDto.userName && updateUserDto.userName !== user.userName) {
  //     const existingUserByName = await this.usersRepository.findOne({ where: { userName: updateUserDto.userName } });
  //     if (existingUserByName) {
  //       throw new ConflictException('This userName is already in use.');
  //     }
  //   }

  //   // 비밀번호 변경을 요청한 경우, 해시화
  //   if (updateUserDto.password) {
  //     user.password = await bcrypt.hash(updateUserDto.password, 10);  // 비밀번호 해시화
  //   }

  //   // 사용자 정보 업데이트 (필요한 정보만 덮어쓰기)
  //   Object.assign(user, updateUserDto);

  //   return this.usersRepository.save(user);  // 변경된 정보 저장
  // }

}
