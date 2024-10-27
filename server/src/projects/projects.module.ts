import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Projects } from './entity/projects.entity';
import { Users } from '../users/entity/users.entity'; 
import { UsersModule } from '../users/users.module';
import { ConversationsModule } from '../conversations/conversations.module'; // ConversationsModule 가져오기

@Module({

  imports: [TypeOrmModule.forFeature([Projects, Users]), UsersModule, ConversationsModule], 
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
