import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

// TypeORM entities
import { TypeOrmModule } from '@nestjs/typeorm';
import { Projects } from './projects/entity/projects.entity';
import { User } from './users/entity/users.entity';
import { Secrets } from './users/entity/secrets.entity';
import { ArchBoards } from './archboards/entity/archboards.entity';
import { Service } from './archboards/entity/service.entity';  // Ensure this exists
import { ArchService } from './archboards/entity/archservice.entity';


import { TerraformsModule } from './terraforms/terraform.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',  // Database type
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || '1234',
      database: process.env.DATABASE_NAME || 'my_test',
      entities: [Projects, User, Secrets, ArchBoards, Service, ArchService],  
      synchronize: true,  // Development setting
    }),
    TerraformsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
