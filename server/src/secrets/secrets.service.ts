import { Return } from './../../node_modules/aws-sdk/clients/cloudsearchdomain.d';
import { Injectable } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Secrets } from './entity/secrets.entity';
import { Users } from '../users/entity/users.entity';

import * as crypto from 'crypto';
import { readFileSync } from 'fs';

@Injectable()
export class SecretsService {
  private publicKey: string;
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

    this.publicKey = readFileSync('public_key.pem', 'utf-8');
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

    // const encryptedAccessKey = this.encrypt(AccessKey);
    // const encryptedSecretAccessKey = this.encrypt(SecretAccessKey);
  

    const secret = this.secretsRepository.create({
      AccessKey: AccessKey,
      SecretAccessKey: SecretAccessKey,
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
    async getUserCredentials(userId: number): Promise<{ accessKey: string; secretAccessKey: string; region: string;}> {
      const secrets = await this.secretsRepository.findOne({ where: { UID: userId } });
      if (!secrets) {
        throw new InternalServerErrorException('User credentials not found');
      }
    
      // Decrypt the stored access keys
      // const decryptedAccessKeyId = this.decrypt(secrets.AccessKey);
      // const decryptedSecretAccessKey = this.decrypt(secrets.SecretAccessKey);
      const region = secrets.region;
    
      return {
        accessKey: secrets.AccessKey,
        secretAccessKey: secrets.SecretAccessKey,
        region: region
      };
    }

    // 시크릿 업데이트 함수
    async updateSecret(userId: number, AccessKey: string, SecretAccessKey: string, Region: string) {
      const user = await this.usersRepository.findOne({ where: { UID: userId } });
      if (!user) {
        throw new Error('User not found');
      }
  
      if (!AccessKey || !SecretAccessKey) {
        throw new Error('One or more keys are missing');
      }
  
      const encryptedAccessKey = this.encrypt(AccessKey);
      const encryptedSecretAccessKey = this.encrypt(SecretAccessKey);
  
      const secret = await this.secretsRepository.findOne({ where: { UID: userId } });
      if (!secret) {
        throw new Error('Secret not found');
      }
  
      secret.AccessKey = encryptedAccessKey;
      secret.SecretAccessKey = encryptedSecretAccessKey;
      secret.region = Region;
  
      await this.secretsRepository.save(secret);
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

  getPublicKey(): string {
    return this.publicKey;
  }

  testRSAEncryptionDecryption(): string {
    try {
      // 1. 공개 키와 개인 키를 로컬 파일에서 읽어옵니다.
      const publicKeyPem = readFileSync('public_key.pem', 'utf-8');
      const privateKeyPem = readFileSync('private_key.pem', 'utf-8');

      console.log("로드된 공개 키:\n", publicKeyPem);
      console.log("로드된 개인 키:\n", privateKeyPem);

      // 2. 테스트용 메시지를 정의합니다.
      const message = "RSA 암호화 및 복호화 테스트 메시지입니다.";
      console.log("\n원본 메시지:", message);

      // 3. 공개 키로 메시지를 암호화합니다.
      const encryptedData = crypto.publicEncrypt(
        {
          key: publicKeyPem,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(message, 'utf-8')
      );

      // 암호화된 데이터를 Base64 문자열로 변환하여 출력합니다.
      const encryptedBase64 = encryptedData.toString('base64');
      console.log("\n암호화된 메시지 (Base64):", encryptedBase64);

      // 4. 개인 키로 메시지를 복호화합니다.
      const decryptedData = crypto.privateDecrypt(
        {
          key: privateKeyPem,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        encryptedData
      );

      // 복호화된 데이터를 문자열로 변환하여 출력합니다.
      const decryptedMessage = decryptedData.toString('utf-8');
      console.log("\n복호화된 메시지:", decryptedMessage);

      // 5. 원본 메시지와 복호화된 메시지를 비교하여 일치 여부를 확인합니다.
      if (decryptedMessage === message) {
        console.log("\n성공: 복호화된 메시지가 원본 메시지와 일치합니다.");
        return "성공: 복호화된 메시지가 원본 메시지와 일치합니다.";
      } else {
        console.log("\n오류: 복호화된 메시지가 원본 메시지와 일치하지 않습니다.");
        return "오류: 복호화된 메시지가 원본 메시지와 일치하지 않습니다.";
      }
    } catch (error) {
      console.error("RSA 테스트 중 오류 발생:", error);
      return `오류 발생: ${error.message}`;
    }
  }

}
