import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

// TypeORM entities
import { TypeOrmModule } from '@nestjs/typeorm';
import { Projects } from './projects/entity/projects.entity';
import { Users } from './users/entity/users.entity';
import { Secrets } from './users/entity/secrets.entity';
import { ArchBoards } from './archboards/entity/archboards.entity';
import { Service } from './archboards/entity/service.entity';  // Ensure this exists
import { ArchService } from './archboards/entity/archservice.entity';

import { ProjectsModule } from './projects/projects.module';
import { TerraformsModule } from './terraforms/terraform.module';
import { ConversationsController } from './conversations/conversations.controller';
import { ConversationsModule } from './conversations/conversations.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    ProjectsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',  // Database type
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || '1234',
      database: process.env.DATABASE_NAME || 'my_test',
      entities: [Projects, Users, Secrets, ArchBoards, Service, ArchService],  
      synchronize: true,  // Development setting
    }),
    TerraformsModule,
    ConversationsModule,
  ],
  controllers: [AppController, ConversationsController],

  providers: [AppService],
})
export class AppModule {}
