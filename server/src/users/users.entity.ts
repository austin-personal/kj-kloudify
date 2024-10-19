import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')  // MySQL의 users 테이블에 매핑
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
