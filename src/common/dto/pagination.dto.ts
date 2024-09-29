import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    required: true,
    default: 1,
  })
  page: number = 1; // Default page

  @ApiProperty({
    required: true,
    default: 10,
  })
  limit: number = 10; // Default limit per page

  @ApiProperty({
    required: false,
    default: '',
  })
  keyword?: string; // Keyword untuk pencarian global
}
