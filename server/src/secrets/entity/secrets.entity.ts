import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Users } from '../../users/entity/users.entity';

@Entity()
export class Secrets {
  @PrimaryGeneratedColumn()
  SID: number;  // Primary Key

  @Column()
  accessKey: string;

  @Column()
  secretAccessKey: string;

  @Column({ nullable: true })  // key-pair for access to EC2. It is now optional
  securityKey: string;

  @Column()
  UID: number;  // Foreign Key (Architecture)

  @OneToOne(() => Users, (user) => user.secrets)
  user: Users;
}
