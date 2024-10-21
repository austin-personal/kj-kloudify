import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Users } from '../../users/entity/users.entity';
import { ArchBoards } from '../../archboards/entity/archboards.entity';

@Entity()
export class Projects {
  @PrimaryGeneratedColumn()
  PID: number;  // Primary Key

  @Column()
  projectName: string;

  @Column()
  createdDate: Date;

  @Column()
  CID: number;  // Foreign Key (Conversation)

  @Column()
  ARCTID: number;  // Foreign Key (Architecture)

  @Column()
  UID: number;  // Foreign Key (Architecture)

  @ManyToOne(() => Users, (users) => users.projects)
  user: Users;

  @OneToMany(() => ArchBoards, (archBoard) => archBoard.projects)
  archBoards: ArchBoards[];
}
