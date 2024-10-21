import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TerraformService } from './terraform.service';
import { UsersService } from '../users/users.service';
import { Request } from 'express';

@Controller('terraforms')
export class TerraformController {
  constructor(
    private readonly terraformService: TerraformService,
    private readonly usersService: UsersService,
  ) {}

  // JWT 인증된 사용자만 접근 가능
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(
    @Body() body: Array<{ service: string; options: any }>, 
    @Req() req: Request
  ) {
    const userEmail = req.user.email;  // JWT 토큰에서 이메일 추출
    const user = await this.usersService.findOneByEmail(userEmail);  // 이메일로 DB에서 사용자 조회

    // DB에서 가져온 AWS 자격 증명을 Terraform에 전달
    const awsCredentials = {
      accessKeyId: user.awsAccessKeyId,
      secretAccessKey: user.awsSecretAccessKey,
    };

    return await this.terraformService.createTerraform(body, awsCredentials);
  }


  // POST /terraforms/destroy - 테라폼 리소스 삭제
  @Post('destroy')
  async destroy() {
    return await this.terraformService.destroyTerraform();
  }

  // POST /terraforms/show - 테라폼 상태 확인
  @Post('show')
  async show() {
    return await this.terraformService.showTerraformState();
  }
}
