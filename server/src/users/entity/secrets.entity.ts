import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Users } from './users.entity';

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

  @OneToOne(() => Users, (user) => user.secrets)
  user: Users;
}
