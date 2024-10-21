import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { ArchBoards } from './archboards.entity';

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  SID: number;  // Primary Key

  @Column()
  serviceName: string;

  @Column()
  category: string;  // 서버, DB 등 카테고리 구분

  @ManyToMany(() => ArchBoards, (archBoard) => archBoard.services)
  archServices: ArchBoards[];
}
