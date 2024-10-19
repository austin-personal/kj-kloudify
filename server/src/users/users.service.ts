import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from './users.interface';  // User 인터페이스 가져오기
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  private readonly users: User[] = [];  // User 타입으로 정의

  constructor(private readonly jwtService: JwtService) {}  // JwtService 주입

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(username: string, password: string, email?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: this.users.length + 1,
      username,
      password: hashedPassword,
      email: email || '',  // email 필드 명시
      createdAt: new Date(),  // createdAt 필드 추가
    };
    this.users.push(newUser);
    return newUser;
  }

  async login(user: Omit<User, 'password'>): Promise<{ access_token: string }> {
    const payload = { username: user.username, sub: user.id };  // JWT 페이로드
    return {
      access_token: this.jwtService.sign(payload),  // 실제 JWT 발급
    };
  }
  

  async validateUser(username: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.findOne(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;  // 비밀번호는 제외하고 반환
      return result;
    }
    return null;
  }
}
