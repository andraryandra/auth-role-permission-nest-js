import { SetMetadata } from '@nestjs/common';

export const REQUIRES_PERMISSION_KEY = 'requires_permission';
export const Permission = (permission: string) =>
  SetMetadata(REQUIRES_PERMISSION_KEY, permission);
