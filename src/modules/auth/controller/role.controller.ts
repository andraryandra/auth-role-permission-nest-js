import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { RoleService } from '../service/role.service';
import { CreateRoleDto, RoleDto } from '../dto/role.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth.guard';
import { ResponseFormatter } from 'src/config/response_formatter';
import { Permission } from 'src/decorators/requires-permission.decorator';

@ApiTags('Roles and Permissions')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles data',
    type: RoleDto,
  })
  @Permission('read:role')
  @Get()
  async findAll() {
    const roles = await this.roleService.findAll();

    return new ResponseFormatter(roles, 'Roles found');
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles data',
    type: CreateRoleDto,
  })
  @Permission('create:role')
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.roleService.create(createRoleDto);

    return new ResponseFormatter(role, 'Role created');
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles data',
    type: RoleDto,
  })
  @Permission('read:role')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const role = await this.roleService.findOne(id);

    return new ResponseFormatter(role, 'Role found');
  }
}
