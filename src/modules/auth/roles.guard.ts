import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRES_PERMISSION_KEY } from 'src/decorators/requires-permission.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      REQUIRES_PERMISSION_KEY,
      context.getHandler(),
    );
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Debug output to ensure that permissions are present
    console.log('User Permissions:', user.permissions);
    console.log('Required Permission:', requiredPermission);

    if (!user.permissions || !user.permissions.includes(requiredPermission)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
