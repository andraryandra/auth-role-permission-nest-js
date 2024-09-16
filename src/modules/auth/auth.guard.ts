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

    // Proceed to check roles and permissions
    const requiredPermission = this.reflector.get<string>(
      REQUIRES_PERMISSION_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true; // No specific permission required
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

    // Ensure user object has permissions property
    if (!user.permissions) {
      user.permissions = []; // Default to empty array if not present
    }

    return user;
  }
}
