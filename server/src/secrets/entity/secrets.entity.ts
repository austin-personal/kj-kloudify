import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Users } from '../../users/entity/users.entity';

@Entity()
export class Secrets {
  @PrimaryGeneratedColumn()
  SID: number;  // Primary Key

  @Column({ type: 'text' })
  AccessKey: string;

  @Column({ type: 'text' })
  SecretAccessKey: string;

  @Column({ type: 'text' })
  region: string;

  @Column()
  UID: number;  

  @OneToOne(() => Users, (user) => user.secrets)
  user: Users;
}
