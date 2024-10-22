import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Projects } from './entity/projects.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Users } from '../users/entity/users.entity'; // 유저 엔티티 연결

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Projects)
    private readonly projectRepository: Repository<Projects>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  // 새로운 프로젝트 생성
  async create(createProjectDto, user): Promise<Projects> {
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const project = this.projectRepository.create({
      projectName: createProjectDto.projectName,
      createdDate: new Date(),
      user,
    });

    return this.projectRepository.save(project);
  }

  async findOne(id: number): Promise<Projects> {
    const project = await this.projectRepository.findOne({ where: { PID: id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }
  

  // 모든 프로젝트 가져오기
  async findAll(userId: number): Promise<Projects[]> {
    const user = await this.userRepository.findOne({ where: { UID: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // 유저와 연결된 모든 프로젝트 가져오기
    return this.projectRepository.find({ where: { user: user } });
  }
  

  // 특정 프로젝트 가져오기
  async findOneByPID(PID: number): Promise<Projects> {
    const project = await this.projectRepository.findOne({ where: { PID } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }
  
  // UID로 프로젝트 검색
  async findAllByUserId(userId: number): Promise<Projects[]> {
    return this.projectRepository.find({ where: { UID: userId } });
  }

  // 프로젝트 업데이트
  async update(id: number, updateProjectDto: UpdateProjectDto): Promise<Projects> {
    const project = await this.findOne(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  // 프로젝트 삭제
  async remove(id: number): Promise<void> {
    const project = await this.findOne(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.projectRepository.remove(project);
  }
}
