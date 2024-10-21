import { Module } from '@nestjs/common';
import { TerraformService } from './terraform.service';
import { TerraformController } from './terraform.controller';


@Module({
  providers: [TerraformService],
  controllers: [TerraformController],
})
export class TerraformsModule {}
