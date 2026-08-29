import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column({ type: 'timestamptz', name: 'created_at' }) createdAt!: Date;
}
