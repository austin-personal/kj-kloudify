import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Projects } from '../../projects/entity/projects.entity';
import { Secrets } from './secrets.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  UID: number;  // Primary Key

  @Column({ nullable: false })
  userName: string;

  @Column({ nullable: false })
  password: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Projects, (project) => project.user)
  projects: Projects[];

  @OneToOne(() => Secrets, (secrets) => secrets.user)
  @JoinColumn()  // One-to-one relationship, join with Secrets table
  secrets: Secrets;
}
