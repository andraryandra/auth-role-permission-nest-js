import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/modules/auth/entities/user.entity';
import { UserProfileDto } from '../dto/user.dto';
import { PaginationService } from 'src/common/pagination-table.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(payload: UserProfileDto) {
    const { page = 1, limit = 10, keyword } = payload;

    const userQueryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .leftJoinAndSelect('role.rolePermissions', 'rolePermissions')
      .leftJoinAndSelect('rolePermissions.permission', 'permission')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.avatar',
        'role',
        'permission',
        'userRoles',
        'rolePermissions',
      ]);

    // Pencarian global berdasarkan keyword
    const searchFields = ['user.username', 'user.email', 'role.name'];

    if (keyword) {
      searchFields.forEach((field) => {
        userQueryBuilder.orWhere(`${field} LIKE :keyword`, {
          keyword: `%${keyword}%`,
        });
      });
    }

    const [users, totalData] = await userQueryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const processedData = users.map((user) => {
      const role =
        Array.isArray(user.userRoles) && user.userRoles.length > 0
          ? user.userRoles[0].role.name
          : '';
      const permissions = Array.isArray(user.userRoles)
        ? user.userRoles.flatMap((userRole) =>
            userRole.role.rolePermissions.map(
              (rolePermission) => rolePermission.permission.name,
            ),
          )
        : [];

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role,
        permissions,
      };
    });

    const { currentPage, totalPages } = PaginationService.getPaginationMetadata(
      {
        totalData,
        page,
        limit: limit,
      },
    );

    return {
      data: processedData,
      metadata: {
        currentPage,
        totalPages,
      },
    };
  }
}
