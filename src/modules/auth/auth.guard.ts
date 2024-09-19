import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { REQUIRES_PERMISSION_KEY } from 'src/decorators/requires-permission.decorator';

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if authentication is valid
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    // Get required permissions from both method and class level
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      REQUIRES_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no specific permission is required, allow access
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Ensure user has permissions
    if (!user || !user.permissions) {
      console.log('User Permissions: Not available');
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    console.log('User Permissions:', user.permissions);
    console.log('Required Permission:', requiredPermission);

    // Check if the user has the required permission
    if (!user.permissions.includes(requiredPermission)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    // console.log('Decoded User:', user);

    if (!user.permissions) {
      user.permissions = [];
    }

    return user;
  }
}
