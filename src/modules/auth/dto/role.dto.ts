import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class RoleDto extends PaginationDto {
  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  description?: string;
}

export class CreateRoleDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;
}
