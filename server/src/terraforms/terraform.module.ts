import { Module } from '@nestjs/common';
import { TerraformController } from './terraform.controller';
import { TerraformService } from './terraform.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretsModule } from '../secrets/secrets.module';
import { Secrets } from '../secrets/entity/secrets.entity';
import { UsersModule } from '../users/users.module';
import { Projects } from '../projects/entity/projects.entity';
import { ProjectsService } from '../projects/projects.service'; 
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([Secrets,Projects]), SecretsModule, UsersModule, ProjectsModule],
  controllers: [TerraformController],
  providers: [TerraformService],
})
export class TerraformsModule {}
