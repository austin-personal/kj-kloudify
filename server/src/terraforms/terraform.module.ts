import { Module } from '@nestjs/common';
import { TerraformController } from './terraform.controller';
import { TerraformService } from './terraform.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretsModule } from '../secrets/secrets.module';
import { Secrets } from '../secrets/entity/secrets.entity';
import { UsersModule } from '../users/users.module';
import { Projects } from '../projects/entity/projects.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Secrets,Projects]), SecretsModule, UsersModule],
  controllers: [TerraformController],
  providers: [TerraformService],
})
export class TerraformsModule {}
