import { Controller, Post, Body, Delete, Req, UseGuards,Get , BadRequestException , NotFoundException , } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../users/jwt-auth.guard';

@Controller('secrets')
export class SecretsController {
  constructor(
    private readonly secretsService: SecretsService,
    private readonly usersService: UsersService
  ) {}

  // @UseGuards(JwtAuthGuard) // JwtAuthGuard를 바로 사용
  @Post()
  async createSecret(
    @Body('accessKey') accessKey: string,
    @Body('secretAccessKey') secretAccessKey: string,
    @Body('region') region: string,
    @Body('email') email: string, // 요청 본문에서 이메일도 받아옴
    // @Req() req
  ): Promise<{ message: string }> {
    // const email = req.user.email;  // JWT에서 이메일 추출
  
    // accessKey와 secretAccessKey가 모두 존재하는지 확인
    if (accessKey && secretAccessKey) {
      console.log("Secrets-createSecret: All Keys received");
    } else {
      throw new Error("Missing accessKey or secretAccessKey");
    }
  
    const userInfo = await this.usersService.findOneByEmail(email);  // 이메일로 사용자 조회
    const userId = userInfo.UID;
    await this.secretsService.createSecret(userId, accessKey, secretAccessKey,region);
    // secretsService를 호출하여 새로운 Secret 생성
    return { message: 'Secret successfully created' };
  }

  // Delete Secrets API
  // @UseGuards(JwtAuthGuard) // JwtAuthGuard를 바로 사용
  @Delete()
  async deleteSecret(@Body('email') email: string): Promise<{ message: string }> {
    // 이메일이 요청 본문에 없으면 에러 발생
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // 이메일로 사용자 조회
    const userInfo = await this.usersService.findOneByEmail(email);
    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    const id = userInfo.UID;
    await this.secretsService.deleteSecret(id);

    return { message: 'Secret deleted successfully' };
  }

  // @UseGuards(JwtAuthGuard) // JwtAuthGuard를 바로 사용
  @Post('check')
  async checkSecret(@Body('email') email: string): Promise<{ exists: boolean }> {
    // 이메일이 요청 본문에 없으면 에러 발생
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // 이메일로 사용자 조회
    const userInfo = await this.usersService.findOneByEmail(email);
    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    const id = userInfo.UID;

    // UID로 Secret 조회
    const secret = await this.secretsService.secretCheck(id);
    console.log("secret check(bool): ", !!secret);

    // Secret이 존재하는지 여부를 논리값으로 반환
    return { exists: !!secret };
  }

  @Get('public-key')
  getPublicKey(): { publicKey: string } {
    // 공개 키를 JSON 형식으로 반환
    return { publicKey: this.secretsService.getPublicKey() };
  }

  @Get('rsa-test')
  testRSA(): string {
    // RsaService의 테스트 함수를 호출
    return this.secretsService.testRSAEncryptionDecryption();
  }
  
}
