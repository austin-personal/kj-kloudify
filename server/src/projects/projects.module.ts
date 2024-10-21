import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Projects } from './entity/projects.entity';
import { Users } from '../users/entity/users.entity'; // User 엔티티 추가

@Module({
  imports: [TypeOrmModule.forFeature([Projects, Users])],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
