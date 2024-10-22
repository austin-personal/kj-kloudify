import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Projects } from './entity/projects.entity';
import { Users } from '../users/entity/users.entity'; 
import { UsersModule } from '../users/users.module';

@Module({

  imports: [TypeOrmModule.forFeature([Projects, Users]), UsersModule], 
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
