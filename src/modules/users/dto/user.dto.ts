import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class UserProfileDto extends PaginationDto {
  @ApiPropertyOptional()
  username: string;

  @ApiPropertyOptional()
  email: string;

  @ApiPropertyOptional()
  roles: string[];
}
