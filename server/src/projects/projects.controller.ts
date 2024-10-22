import { Controller, Get, Post, Body, Param, Delete, Patch, NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Projects } from './entity/projects.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../users/jwt-auth.guard';
import { Req } from '@nestjs/common';
import { UsersService } from '../users/users.service'; // UsersService 추가

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService // UsersService 주입
  ) {}
  

  // // 새로운 프로젝트 생성
  // @UseGuards(JwtAuthGuard) // JWT 인증 가드 사용
  // @Post()
  // create(@Body() createProjectDto: CreateProjectDto): Promise<Projects> {
  //   return this.projectsService.create(createProjectDto);
  // }

  // 새로운 프로젝트 생성
  @UseGuards(JwtAuthGuard) // JWT 인증 가드 사용
  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req): Promise<Projects> {
    const email = req.user.email; // JWT 가드가 통과된 후 req.user에서 이메일 추출
    const user = await this.usersService.findOneByEmail(email); // 이메일로 사용자 검색
    console.log(user);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // CreateProjectDto에 UID를 받지 않고, 추출된 UID를 사용
    return this.projectsService.create(createProjectDto, user);
  }


  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req): Promise<Projects[]> {
    const email = req.user.email; // JWT에서 이메일 추출
    const user = await this.usersService.findOneByEmail(email); // 이메일로 사용자 검색
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userId = user.UID; // UID 가져오기
    return this.projectsService.findAllByUserId(userId); // UID로 프로젝트 검색
  }

  // 프로젝트 업데이트
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateProjectDto: UpdateProjectDto): Promise<Projects> {
    return this.projectsService.update(id, updateProjectDto);
  }

  // 프로젝트 삭제
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.projectsService.remove(id);
  }
}
