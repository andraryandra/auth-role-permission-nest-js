import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwt_config } from 'src/config/config_jwt';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { BaseEntity } from 'src/config/common/BaseEntity';
import { AuthService } from './service/auth.service';
import { RoleService } from './service/role.service';
import { RoleController } from './controller/role.controller';
import { RoleEntity } from './entities/role.entity';
import { UserRoleEntity } from './entities/user_roles.entity';
import { RolePermissionEntity } from './entities/role_permissions.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      BaseEntity,
      RoleEntity,
      UserRoleEntity,
      RolePermissionEntity,
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({
      secret: jwt_config.secret,
      signOptions: {
        expiresIn: jwt_config.expired,
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, RoleService],
  controllers: [AuthController, RoleController],
})
export class AuthModule {}
