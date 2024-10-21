import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Projects } from '../../projects/entity/projects.entity';
import { Service } from './service.entity';
import { ArchService } from './archservice.entity';

@Entity()
export class ArchBoards {
  @PrimaryGeneratedColumn()
  AID: number;  // Primary Key

  @Column()
  createdDate: Date;

  @ManyToOne(() => Projects, (projects) => projects.archBoards)
  projects: Projects;

  @ManyToMany(() => Service)
  @JoinTable({ name: 'ArchService' })  // Junction Table을 명시
  services: Service[];
}
