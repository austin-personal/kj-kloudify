import { Controller, Post, Body } from '@nestjs/common';
import { TerraformService } from './terraform.service';

@Controller('terraforms')
export class TerraformController {
  constructor(private readonly terraformService: TerraformService) {}

  // POST /terraforms/create - 키워드를 받아 Terraform 파일 생성 및 실행
  @Post('create')
  async create(@Body() body: Array<{ service: string; options: any }>) {
    return await this.terraformService.createTerraform(body);
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
