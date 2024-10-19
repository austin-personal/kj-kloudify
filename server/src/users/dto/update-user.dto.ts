// src/users/dto/update-user.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly username?: string;

  @IsOptional()
  @IsString()
  readonly password?: string;
}
