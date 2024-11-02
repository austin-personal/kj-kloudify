import { Return } from './../../node_modules/aws-sdk/clients/cloudsearchdomain.d';
import { Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Secrets } from './entity/secrets.entity';
import { Users } from '../users/entity/users.entity';

import * as crypto from 'crypto';


@Injectable()
export class SecretsService {
  private encryptionKey: Buffer;
// TypeORM 연결: User, Secrets entity
  constructor(
    @InjectRepository(Secrets)
    private secretsRepository: Repository<Secrets>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 32) {  // AES-256 needs a 32-byte key
      throw new Error('Invalid encryption key. It must be 32 characters long.');
    }
    this.encryptionKey = Buffer.from(key, 'utf-8');
  }

// 새로운 Secrets 생성 함수
  async createSecret(userId: number, AccessKey: string, SecretAccessKey: string, Region: string) {
    const user = await this.usersRepository.findOne({ where: { UID: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    if (!AccessKey || !SecretAccessKey) {
      throw new Error('One or more keys are missing');
    }

    const alreadySecret = await this.secretsRepository.findOne({ where: { UID: userId } });
    if (alreadySecret) {
      throw new Error('이미 AWS credential이 있습니다');
    }

    const encryptedAccessKey = this.encrypt(AccessKey);
    const encryptedSecretAccessKey = this.encrypt(SecretAccessKey);
  

    const secret = this.secretsRepository.create({
      AccessKey: encryptedAccessKey,
      SecretAccessKey: encryptedSecretAccessKey,
      region: Region,
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

// 현재 유저의 AWS Credential 유무 확인
  async secretCheck(userId: number): Promise<boolean> {
    const secret = await this.secretsRepository.findOne({ where: { UID: userId } });

    return !!secret;
  }
    /**
   * 사용자 자격 증명 조회 및 복호화
   */
    async getUserCredentials(userId: number): Promise<{ accessKey: string; secretAccessKey: string; }> {
      const secrets = await this.secretsRepository.findOne({ where: { UID: userId } });
      if (!secrets) {
        throw new InternalServerErrorException('User credentials not found');
      }
    
      // Decrypt the stored access keys
      const decryptedAccessKeyId = this.decrypt(secrets.AccessKey);
      const decryptedSecretAccessKey = this.decrypt(secrets.SecretAccessKey);
    
      return {
        accessKey: decryptedAccessKeyId,
        secretAccessKey: decryptedSecretAccessKey,
      };
    }
  /**
   * 암호화 메서드
   */
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * 복호화 메서드
   */
  decrypt(encryptedText: string): string {

    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
