import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecretsService } from './secrets.service';
import { SecretsController } from './secrets.controller';
import { Secrets } from './entity/secrets.entity';

import { Users } from '../users/entity/users.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Secrets, Users]),UsersModule], 
  providers: [SecretsService],  
  controllers: [SecretsController], 
})
export class SecretsModule {}
