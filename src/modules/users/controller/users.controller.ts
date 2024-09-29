import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { UsersService } from '../services/users.service';
import { UserProfileDto } from '../dto/user.dto';

@ApiTags('User')
@ApiBearerAuth('accessToken')
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users data',
    type: UserProfileDto,
  })
  @Get()
  async findAll(@Query() query: UserProfileDto) {
    const results = await this.usersService.findAll(query);

    return results;
  }
}
