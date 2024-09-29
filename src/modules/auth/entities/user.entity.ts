import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRoleEntity } from './user_roles.entity';
import { BaseEntity } from 'src/config/common/BaseEntity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar?: string;

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user)
  userRoles: UserRoleEntity[];
}
