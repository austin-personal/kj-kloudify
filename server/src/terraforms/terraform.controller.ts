import { Controller, Post, Body, Req, UseGuards, Res, Query , InternalServerErrorException , BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { TerraformService } from './terraform.service';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';

import { UnauthorizedException } from '@nestjs/common';

import { ReviewDto } from './dto/review.dto';
import { DeployDto } from './dto/deploy.dto';
import { DownloadDto } from './dto/download.dto';
import { JwtAuthGuard } from '../users/jwt-auth.guard';

class DestroyDto {
  CID: number;
  email: string;
}

@Controller('terraforms')
export class TerraformController {
  constructor(
    private readonly terraformService: TerraformService,
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService
  ) {}

  /**
   * 리뷰 엔드포인트: Terraform 코드 생성
   */
  // @UseGuards(JwtAuthGuard)
  @Post('review')
  async review(@Body() reviewDto: ReviewDto, @Req() req ) {
    // const email = req.user.email;
    // const userInfo = await this.usersService.findOneByEmail(email); 

    const projectInfo = await this.projectsService.findOneByPID(reviewDto.PID);

    //  유저 와 해당 프로젝트 매치 확인하기
    if (userInfo.UID !== projectInfo.UID) {
      throw new UnauthorizedException('Use does not match with the project(!CID)');
    }

    //  프로젝트와 conversationID 메치 확인하기
    if (projectInfo.CID !== reviewDto.CID) {
      throw new UnauthorizedException('Use does not match with the project(!CID)');
    }

    const result = await this.terraformService.reviewInfrastructure(reviewDto);
    return result;
  }

  /**
   * 배포 엔드포인트: Terraform 코드 실행
   */
  // @UseGuards(JwtAuthGuard)
  @Post('deploy')
  async deploy(@Body() deployDto: DeployDto, @Req() req) {
    // const email = req.user.email;
    // const userInfo = await this.usersService.findOneByEmail(email);  // 이메일로 사용자 조회
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

  // @UseGuards(JwtAuthGuard)
  @Post('destroy')
  async destroy(@Body() destroyDto: DestroyDto, @Req() req) {
    const email = destroyDto.email;
    const userInfo = await this.usersService.findOneByEmail(email);  // 이메일로 사용자 조회
    const userId = userInfo.UID;

    try {
      const result = await this.terraformService.destroyInfrastructure(destroyDto.CID, userId);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to destroy infrastructure for CID: ${destroyDto.CID}`);
    }
  }
  
  // @UseGuards(JwtAuthGuard)
  @Post('state')
  async getState(@Body() deployDto: DeployDto, @Req() req, @Res() res) {
    const controller = new AbortController();
    const signal = controller.signal;
  
    // 클라이언트 연결 종료 시 이벤트 감지
    req.on('close', () => {
      console.log('Client connection closed');
      controller.abort(); // 비동기 작업 중단
    });
  
    const email = deployDto.email;
    const userInfo = await this.usersService.findOneByEmail(email);
    const userId = userInfo.UID;

    try {
      const result = await this.terraformService.getInfrastructureState(deployDto.CID, userId, signal);
      return res.status(200).send(result);
    } catch (error) {
      if (signal.aborted) {
        return res.status(400).send('Request was aborted by the client');
      }
      return res.status(500).send(`Failed to retrieve state for CID: ${deployDto.CID}`);
    }
  }

  // @UseGuards(JwtAuthGuard)
  @Post('terraInfo')
  async getTerraInfo(@Body() deployDto: DeployDto) {
    const filePath = `/tmp/${deployDto.CID}/main.tf`; // main.tf 파일을 포함한 전체 경로
    try {
      const result = await this.terraformService.getLocalFileContent(filePath);
      return result;
    } catch (error) {
      console.error(`Error reading file at path: ${filePath}`, error); // 오류 로그 추가
      throw new Error(`Failed to retrieve content from file at path: ${filePath}`);
    }
  }
  
}
