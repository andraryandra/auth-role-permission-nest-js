import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { ResponseFormatter } from 'src/config/response_formatter';
import { CategoryDtoOut } from './dto/category.dto';
import { Permission } from 'src/decorators/requires-permission.decorator';

@ApiTags('Category')
@ApiBearerAuth('accessToken')
@Controller('categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category data',
    type: CreateCategoryDto,
  })
  @Permission('create:category')
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);

    return new ResponseFormatter(category, 'Category created');
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category data',
    type: CategoryDtoOut,
  })
  @Permission('read:category')
  @Get()
  async findAll() {
    const categories = await this.categoriesService.findAll();

    return new ResponseFormatter(categories, 'Categories found');
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category data',
    type: CategoryDtoOut,
  })
  @Permission('read:category')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(+id);

    return new ResponseFormatter(category, 'Category found');
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category data',
    type: UpdateCategoryDto,
  })
  @Permission('update:category')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(
      +id,
      updateCategoryDto,
    );

    return new ResponseFormatter(category, 'Category updated');
  }

  @Permission('delete:category')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const category = await this.categoriesService.remove(+id);

    return new ResponseFormatter(category, 'Category deleted');
  }
}
