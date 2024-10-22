import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Projects } from './entity/projects.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../users/jwt-auth.guard';
import { Req } from '@nestjs/common';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // 새로운 프로젝트 생성
  @Post()
  create(@Body() createProjectDto: CreateProjectDto): Promise<Projects> {
    return this.projectsService.create(createProjectDto);
  }

  // 특정 프로젝트 정보 가져오기
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Projects> {
    return this.projectsService.findOne(id);
  }

  // // 모든 프로젝트 가져오기
  // @UseGuards(JwtAuthGuard)
  // @Get()
  // async findAll(@Req() req): Promise<Projects[]> {
  //   const userId = req.user.uid; // JWT에서 userId 추출
  //   return this.projectsService.findAll();
  // }

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
