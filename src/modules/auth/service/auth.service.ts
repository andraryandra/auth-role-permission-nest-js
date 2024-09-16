import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from '../dto/register.dto';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, UserDto } from '../dto/login.dto';
import { jwt_config } from 'src/config/config_jwt';
import { unlink } from 'fs/promises';
import { RoleEntity } from '../entities/role.entity';
import { UserRoleEntity } from '../entities/user_roles.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,

    private jwtService: JwtService,
  ) {}

  async getUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  /**
   * Register
   * @param data
   * @returns
   */
  async register(
    data: RegisterDto,
  ): Promise<{ statusCode: number; message: string; data: UserDto }> {
    const checkUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (checkUser) {
      throw new HttpException('User already exists', HttpStatus.FOUND);
    }

    data.password = await hash(data.password, 12);

    const defaultRole = await this.roleRepository
      .createQueryBuilder('role')
      .where('LOWER(role.name) = LOWER(:name)', { name: 'user' })
      .getOne();

    if (!defaultRole) {
      throw new HttpException(
        'Default role "User" not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const createUser = await this.userRepository.save({
      ...data,
    });

    if (createUser) {
      const userRole = new UserRoleEntity();
      userRole.user = createUser;
      userRole.role = defaultRole;

      await this.userRoleRepository.save(userRole);

      const userResponse: UserDto = {
        email: createUser.email,
        username: createUser.username,
        role: defaultRole.name,
        id: createUser.id,
        permissions: [],
      };

      return {
        statusCode: HttpStatus.OK,
        message: 'User has been created',
        data: userResponse,
      };
    }
  }

  async login(data: LoginDto) {
    const checkUser = await this.userRepository.findOne({
      where: {
        username: data.username,
      },
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
        'userRoles.role.rolePermissions.permission',
      ],
    });

    if (!checkUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const checkPassword = await compare(data.password, checkUser.password);

    if (checkPassword) {
      const permissions = checkUser.userRoles.flatMap((userRole) =>
        userRole.role.rolePermissions.map(
          (rolePermission) => rolePermission.permission.name,
        ),
      );

      const accessToken = this.jwtService.sign({
        sub: checkUser.id,
        email: checkUser.email,
        username: checkUser.username,
        permissions: permissions,
      });

      const role =
        checkUser.userRoles.length > 0 ? checkUser.userRoles[0].role.name : '';

      const userDto = new UserDto();
      userDto.id = checkUser.id;
      userDto.username = checkUser.username;
      userDto.email = checkUser.email;
      userDto.role = role;
      userDto.permissions = permissions;

      return {
        statusCode: HttpStatus.OK,
        message: 'Login success',
        data: userDto,
        accessToken,
      };
    } else {
      throw new HttpException('Password not match', HttpStatus.UNAUTHORIZED);
    }
  }

  async profile(user_id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: user_id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
      },
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
        'userRoles.role.rolePermissions.permission',
      ],
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const role = user.userRoles.length > 0 ? user.userRoles[0].role.name : '';

    const permissions = user.userRoles.flatMap((userRole) =>
      userRole.role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.name,
      ),
    );

    const userDto = new UserDto();
    userDto.id = user.id;
    userDto.username = user.username;
    userDto.email = user.email;
    userDto.role = role;
    userDto.permissions = permissions;

    return userDto;
  }

  async getUserAll() {
    const users = await this.userRepository.find({
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
      },
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
        'userRoles.role.rolePermissions.permission',
      ],
    });

    const userDtos = users.map((user) => {
      const role = user.userRoles.length > 0 ? user.userRoles[0].role.name : '';

      const permissions = user.userRoles.flatMap((userRole) =>
        userRole.role.rolePermissions.map(
          (rolePermission) => rolePermission.permission.name,
        ),
      );

      const userDto = new UserDto();
      userDto.id = user.id;
      userDto.username = user.username;
      userDto.email = user.email;
      userDto.role = role;
      userDto.permissions = permissions;

      return userDto;
    });

    return userDtos;
  }

  async uploadAvatar(user_id: string, avatar) {
    const user = await this.userRepository.findOne({
      where: {
        id: user_id,
      },
    });

    if (user) {
      if (user.avatar) {
        try {
          await unlink(user.avatar);
        } catch (err) {
          console.error(`Failed to delete old avatar: ${err}`);
        }
      }

      const updateAvatar = await this.userRepository.update(
        {
          id: user_id,
        },
        {
          avatar: avatar,
        },
      );

      if (!updateAvatar.affected) {
        throw new HttpException(
          'Failed to update avatar',
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        avatar: avatar,
      };
    } else {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  generateJWT(payload: any) {
    return this.jwtService.sign(payload, {
      secret: jwt_config.secret,
      expiresIn: jwt_config.expired,
    });
  }
}
