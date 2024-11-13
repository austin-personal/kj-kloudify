import { IsString } from 'class-validator';

export class DeployDto {
  @IsString()
  userId: number;
  CID:number;
  email:string;
}