import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { RoleEntity } from '../entities/role.entity';
import { CreateRoleDto, RoleDto } from '../dto/role.dto';
import { PaginationService } from 'src/common/pagination-table.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async findAll(payload: RoleDto) {
    const { page = 1, limit = 10, keyword } = payload;

    const rolesQueryBuilder = this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.rolePermissions', 'rolePermissions')
      .leftJoinAndSelect('rolePermissions.permission', 'permission')
      .select(['role.id', 'role.name', 'role.description', 'role.createdAt'])
      .where('role.isActive = :isActive', { isActive: true })
      .orderBy('role.createdAt', 'DESC');
    const searchFields = ['role.name', 'role.description'];

    if (keyword) {
      const keywordLower = `%${keyword.toLowerCase()}%`;
      rolesQueryBuilder.andWhere(
        new Brackets((qb) => {
          searchFields.forEach((field, index) => {
            if (index === 0) {
              qb.where(`LOWER(${field}) LIKE :keyword`, {
                keyword: keywordLower,
              });
            } else {
              qb.orWhere(`LOWER(${field}) LIKE :keyword`, {
                keyword: keywordLower,
              });
            }
          });
        }),
      );
    }

    // Hitung total data setelah pencarian keyword
    const totalData = await rolesQueryBuilder.getCount();

    // Terapkan pagination setelah pencarian keyword
    const roles = await rolesQueryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const { currentPage, totalPages } = PaginationService.getPaginationMetadata(
      {
        totalData,
        page,
        limit,
      },
    );

    return {
      data: roles,
      metadata: {
        currentPage,
        totalPages,
        total: totalData,
        pageSize: limit,
      },
    };
  }

  async findOne(role_id: string) {
    const role = await this.roleRepository.findOne({
      where: { id: role_id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async create(createRoleDto: CreateRoleDto) {
    const { name } = createRoleDto;

    // Periksa apakah role dengan nama yang sama sudah ada
    const existingRole = await this.roleRepository.findOne({ where: { name } });

    if (existingRole) {
      // Jika role sudah ada, kembalikan error
      throw new BadRequestException('Role with this name already exists');
    }

    // Jika role tidak ada, simpan entitas baru
    const newRole = await this.roleRepository.save(createRoleDto);

    return newRole;
  }

  async update(role_id: string, updateRoleDto: CreateRoleDto) {
    const role = await this.roleRepository.findOne({ where: { id: role_id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.roleRepository.update(role_id, updateRoleDto);

    return updateRoleDto;
  }

  async delete(role_id: string) {
    const role = await this.roleRepository.findOne({ where: { id: role_id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    role.isActive = false;
    role.isInactive = true;

    const updatedRole = await this.roleRepository.save(role);

    return updatedRole;
  }
}
