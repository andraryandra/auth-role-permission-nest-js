import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; // Move the import statement here
import { RoleEntity } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async findAll() {
    const roles = await this.roleRepository.find({
      relations: ['permissions'],
      order: {
        id: 'DESC',
      },
    });

    return roles;
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
    const newRole = await this.roleRepository.save(createRoleDto);

    return newRole;
  }
}
