import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ArchBoards } from './archboards.entity';
import { Service } from './service.entity';

@Entity()
export class ArchService {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ArchBoards, (archBoard) => archBoard.services)
  archBoard: ArchBoards;

  @ManyToOne(() => Service, (service) => service.archServices)
  service: Service;
}
