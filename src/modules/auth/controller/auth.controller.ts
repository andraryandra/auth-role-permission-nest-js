import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileDto } from '../dto/profile.dto';
import { AuthGuard } from '../auth.guard';
import { LoginDto } from '../dto/login.dto';

import { ResponseFormatter } from 'src/config/response_formatter';
import { existsSync, unlink } from 'fs';
// import { RolesGuard } from '../roles.guard';
import { Permission } from 'src/decorators/requires-permission.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // /auth/register
  @Post('/register')
  async register(@Body() data: RegisterDto) {
    return await this.authService.register(data);
  }

  // /auth/login
  @Post('/login')
  async login(@Body() data: LoginDto) {
    return await this.authService.login(data);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile data',
    type: ProfileDto,
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(AuthGuard)
  @Get('/profile')
  async profile(@Req() req) {
    const userId = req.user.id;
    const profile = await this.authService.profile(userId);

    return new ResponseFormatter(profile, 'Profile data');
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get User All Data',
  })
  @ApiBearerAuth('accessToken')
  @UseGuards(AuthGuard)
  @Permission('READ_USER')
  @Get('/user')
  async user() {
    const user = await this.authService.getUserAll();

    return new ResponseFormatter(user, 'Get User All Data');
  }

  @ApiBearerAuth('accessToken')
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Upload avatar JPEG, JPG, PNG',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: 'public/uploads/image',
        filename: (req, file, cb) => {
          const randomName = Math.random().toString(36).substring(7);
          const originalName = file.originalname;
          const extension = originalName.substring(
            originalName.lastIndexOf('.'),
          );
          const fileName = randomName + extension;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg'
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'File type not supported, File Only Support JPG, JPEG, PNG',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 1024 * 1024 * 2, // 2MB
      },
    }),
  )
  @Post('/avatar')
  async avatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.id;
    const nameFolder = '/uploads/image/' + file.filename;

    // Get the user's current avatar
    const user = await this.authService.getUser(userId);

    // If the user has an avatar and the file exists, delete it
    if (user.avatar && existsSync('public' + user.avatar)) {
      try {
        await unlink('public' + user.avatar, (err) => {
          if (err) {
            console.error(`Failed to delete old avatar: ${err}`);
          }
        });
      } catch (err) {
        console.error(`Failed to delete old avatar: ${err}`);
      }
    }

    const uploadAvatar = await this.authService.uploadAvatar(
      userId,
      nameFolder,
    );

    return new ResponseFormatter(uploadAvatar, 'Avatar updated');
  }
}
