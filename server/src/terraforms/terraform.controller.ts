import { Controller, Post, Body, Req, UseGuards, Res, Query , InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';
import { TerraformService } from './terraform.service';
import { UsersService } from '../users/users.service';
import { ReviewDto } from './dto/review.dto';
import { DeployDto } from './dto/deploy.dto';
import { DownloadDto } from './dto/download.dto';
import { JwtAuthGuard } from '../users/jwt-auth.guard';

class DestroyDto {
  CID: number;
}

@Controller('terraforms')
export class TerraformController {
  constructor(
    private readonly terraformService: TerraformService,
    private readonly usersService: UsersService
  ) {}

  /**
   * 리뷰 엔드포인트: Terraform 코드 생성
   */
  @Post('review')
  async review(@Body() reviewDto: ReviewDto) {
    const result = await this.terraformService.reviewInfrastructure(reviewDto);
    return result;
  }

  /**
   * 배포 엔드포인트: Terraform 코드 실행
   */
  @UseGuards(JwtAuthGuard)
  @Post('deploy')
  async deploy(@Body() deployDto: DeployDto, @Req() req) {
    const email = req.user.email;
    const userInfo = await this.usersService.findOneByEmail(email);  // 이메일로 사용자 조회
    deployDto.userId = userInfo.UID;
    const result = await this.terraformService.deployInfrastructure(deployDto);
    return result;
  }

  /**
   * 다운로드 엔드포인트: Terraform 파일 다운로드
   */
  @Post('download')
  async download(@Body() downloadDto: DownloadDto, @Res() res: Response):Promise<void> {
    const result = await this.terraformService.downloadInfrastructure(downloadDto, res);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('destroy')
  async destroy(@Body() destroyDto: DestroyDto, @Req() req) {
    const email = req.user.email;
    const userInfo = await this.usersService.findOneByEmail(email);  // 이메일로 사용자 조회
    const userId = userInfo.UID;

    try {
      const result = await this.terraformService.destroyInfrastructure(destroyDto.CID, userId);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to destroy infrastructure for CID: ${destroyDto.CID}`);
    }
  }

}
