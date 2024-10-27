import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// TypeORM entities
import { TypeOrmModule } from '@nestjs/typeorm';
import { Projects } from './projects/entity/projects.entity';
import { Users } from './users/entity/users.entity';
import { Secrets } from './secrets/entity/secrets.entity';





// All modules
import { UsersModule } from './users/users.module';
import { SecretsModule } from './secrets/secrets.module';
import { ProjectsModule } from './projects/projects.module';
import { TerraformsModule } from './terraforms/terraform.module';
import { ConversationsModule } from './conversations/conversations.module';
import { ConfigModule } from '@nestjs/config';


// 최초 시작모듈

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    ProjectsModule,
    SecretsModule,
    TerraformsModule,
    ConversationsModule,

    TypeOrmModule.forRoot({
      type: 'postgres',  // Database type
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || '1234',
      database: process.env.DATABASE_NAME || 'my_test',
      entities: [Projects, Users, Secrets],  
      synchronize: true,  // Development setting
    }),
  ],
  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
