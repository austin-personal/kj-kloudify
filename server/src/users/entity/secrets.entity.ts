import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { User } from './users.entity';

@Entity()
export class Secrets {
  @PrimaryGeneratedColumn()
  SID: number;  // Primary Key

  @Column()
  accessKey: string;

  @Column()
  secretAccessKey: string;

  @Column()
  securityKey: string;

  @OneToOne(() => User, (user) => user.secrets)
  user: User;
}
