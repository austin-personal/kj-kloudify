import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { TerraformService } from './terraform.service';
import { UsersService } from '../users/users.service';
import { Request } from 'express';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 추후에 추가


@Controller('terraforms')
export class TerraformController {
  constructor(
    private readonly terraformService: TerraformService,

  ) {}

  // // JWT 인증된 사용자만 접근 가능
  // @UseGuards(JwtAuthGuard) 추후에 추가
  @Post('create')
  async create(
    @Body() body: { services: Array<{ service: string; options: any }>, accessKeyId: string, secretAccessKey: string }, 
    @Req() req: Request
  ) {
    const { services, accessKeyId, secretAccessKey } = body;  // Request Body에서 AWS 자격 증명과 서비스 정보 추출

    // AWS 자격 증명으로 Terraform 작업 수행
    const awsCredentials = {
      accessKeyId,
      secretAccessKey,
    };

    return await this.terraformService.createTerraform(services, awsCredentials);

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
