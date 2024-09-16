import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { RoleEntity } from './role.entity';

@Entity('user_roles')
export class UserRoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.userRoles, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => RoleEntity, (role) => role.userRoles, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;
}
