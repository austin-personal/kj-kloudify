import { Controller, Get, Post, Body, Param, Delete, Patch, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Projects } from './entity/projects.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../users/jwt-auth.guard';

import { CurrentUser } from '../users/current-user.decorator';
import { Req } from '@nestjs/common';
import { UsersService } from '../users/users.service'; 
import { ConversationsService } from '../conversations/conversations.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly conversationsService: ConversationsService,
    private readonly usersService: UsersService // UsersService 주입
  ) {}

  // 새로운 프로젝트 생성
  @UseGuards(JwtAuthGuard) // JWT 인증 가드 사용
  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req): Promise<Projects> {
    const email = req.user.email; // JWT 가드가 통과된 후 req.user에서 이메일 추출
    const user = await this.usersService.findOneByEmail(email); // 이메일로 사용자 검색
    console.log("Project create: ",createProjectDto, user);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // CreateProjectDto에 UID를 받지 않고, 추출된 UID를 사용
    return this.projectsService.create(createProjectDto, user);
  }



// 모든 배포된 프로젝트 가져오기
  @UseGuards(JwtAuthGuard)
  @Get('deployed')
  async findAllDeployed(@CurrentUser() user: any): Promise<Projects[]> {
    const email = user.email;
    const foundUser = await this.usersService.findOneByEmail(email);
    const userId = foundUser.UID; 
    console.log("projects-findAllDeployed: ", userId);
    return this.projectsService.findDeployedByUserId(userId); // UID로 프로젝트 검색
  }

  // 모든 배포되지 않은 프로젝트 가져오기
  @UseGuards(JwtAuthGuard)
  @Get('resume')
  async findAllResume(@CurrentUser() user: any): Promise<Projects[]> {
    const email = user.email;
    const foundUser = await this.usersService.findOneByEmail(email);
    const userId = foundUser.UID; 
    console.log("projects-findAllResume: ", userId);
    return this.projectsService.findResumeByUserId(userId); // UID로 프로젝트 검색
  }

//특정 프로젝트 가져오기
  @UseGuards(JwtAuthGuard)
  @Get(':PID')  // Route parameter for PID
  async findOne(
    @CurrentUser() user: any,
    @Param('PID') PID: number  // Use @Param to extract the PID from the URL
  ): Promise<Projects> {
    console.log("project findOne: ", PID);
    
    return this.projectsService.findOneByPID(PID);  // Fetch project by PID
  }

// 프로젝트 삭제
  @UseGuards(JwtAuthGuard)
  @Delete()
  async delete(@CurrentUser() user: any, @Body('PID') PID: number): Promise<void> {
    const email = user.email;
    const foundUser = await this.usersService.findOneByEmail(email);
    const userId = foundUser.UID; 
    console.log("project delete: ",PID, userId);
    
    return this.projectsService.remove(PID, userId); // 서비스로 전달
  }

 // 특정 프로젝트 이어서 시작하기
 @UseGuards(JwtAuthGuard)
 @Get(':PID/resume')
 async resumeProject(
   @CurrentUser() user: any,
   @Param('PID') PID: number
 ): Promise<{ projectName: string; chattings: any[]; archBoardKeywords: any[] }> {
   // 프로젝트 찾기
   const project = await this.projectsService.findOneByPID(PID);
   if (!project || project.isDeployed) {
     throw new NotFoundException('Project not found or already deployed');
   }

   // 프로젝트 이름
   const projectName = project.projectName;

   // 채팅 기록 및 아키텍처 보드 키워드
   const chattings = await this.conversationsService.getConversationsByCID(project.CID);  // 간략한 채팅 기록 반환
   const archBoardKeywords = await this.conversationsService.fetchKeywordsByCID(project.CID);  // 아키텍처 보드의 주요 키워드

   return { projectName, chattings, archBoardKeywords };
 }
 
  // 머메이드 코드 가져오기
  @UseGuards(JwtAuthGuard)
  @Get(':PID/archiboard')
  async getArchiboard(@Param('PID') PID: number): Promise<{ code: any[] }> {
    const project = await this.projectsService.findOneByPID(PID);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const code = await this.projectsService.getMermaidCode(PID);
    return { code };
  }
  // 서비스 요약 해주기
  @UseGuards(JwtAuthGuard)
  @Get(':CID/summary')
  async getSummary(@Param('CID') CID: number): Promise<{ summary: string }> {

      const summary = await this.conversationsService.generateSummary(CID, 'summary');
      console.log("백 summary:",summary);
      return { summary };
  }
  
  @UseGuards(JwtAuthGuard)
  @Get(':CID/price')
  async getPrice(@Param('CID') CID: number): Promise<{ price: string }> {
      const price = await this.conversationsService.generateSummary(CID, 'price');
      return { price };
  }
}
