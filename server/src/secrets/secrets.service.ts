import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Secrets } from './entity/secrets.entity';
import { Users } from '../users/entity/users.entity';

@Injectable()
export class SecretsService {
// TypeORM 연결: User, Secrets entity
  constructor(
    @InjectRepository(Secrets)
    private secretsRepository: Repository<Secrets>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

// 새로운 Secrets 생성 함수
  async createSecret(userId: number, AccessKey: string, SecretAccessKey: string, SecurityKey: string) {
    const user = await this.usersRepository.findOne({ where: { UID: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const secret = this.secretsRepository.create({
      accessKey: AccessKey,
      secretAccessKey: SecretAccessKey,
      securityKey: SecurityKey,
      UID: userId,
    });
    await this.secretsRepository.save(secret);
  }

// 현재 유저의 AWS Credential 삭제
  async deleteSecret(userId: number): Promise<void> {
    const secret = await this.secretsRepository.findOne({ where: { UID: userId } });
    if (!secret) {
      throw new Error('Secret not found');
    }

    await this.secretsRepository.remove(secret);
  }
}
