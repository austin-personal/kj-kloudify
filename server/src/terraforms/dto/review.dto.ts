import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class ReviewDto {
  CID: number;
  PID: number;
  email: string;
}
